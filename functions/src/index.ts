import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();
const db = admin.firestore();

// Note: Secure these with Firebase Secrets matching Finnhub and Gemini keys.
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "demo";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface FinnhubNewsItem {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

// Prompt Engineering template
const SYSTEM_PROMPT = `
You are an expert financial analyst. Analyze the following news article text.
Return JSON ONLY strictly matching this schema:
{
  "summary": "1-2 sentence concise summary of the actual news event",
  "sentiment": number (-1 for bearish/negative, 0 for neutral, 1 for bullish/positive),
  "topics": ["Keyword1", "Keyword2", "Keyword3"] (Maximum 3 core financial/company topics)
}
No markdown, no explanation, only raw JSON.
`;

export const fetchFinancialNews = onSchedule("every 1 hours", async (event) => {
    try {
        logger.info("Starting scheduled news fetch...");

        // 1. Fetch from Finnhub API
        const response = await axios.get<FinnhubNewsItem[]>(
            `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
        );

        const articles = response.data.slice(0, 10); // Process top 10 to save LLM costs

        const batch = db.batch();

        for (const article of articles) {
            // Skip if we already processed this article
            const docRef = db.collection("newsArticles").doc(article.id.toString());
            const docSnap = await docRef.get();
            if (docSnap.exists) continue;

            // 2. Process with LLM
            const promptText = `Headline: ${article.headline}\nContent: ${article.summary}`;

            let aiData = { summary: article.summary, sentiment: 0, topics: ["General"] };

            if (GEMINI_API_KEY) {
                try {
                    const aiResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: promptText,
                        config: {
                            systemInstruction: SYSTEM_PROMPT,
                            temperature: 0.1, // Keep it deterministic
                            responseMimeType: "application/json"
                        }
                    });

                    const text = aiResponse.text;
                    if (text) {
                        aiData = JSON.parse(text);
                    }
                } catch (aiError) {
                    logger.error("AI Processing error for article", article.id, aiError);
                    // Fallback to raw data if AI fails
                }
            }

            // 3. Store structured data
            batch.set(docRef, {
                title: article.headline,
                source: article.source,
                category: article.category,
                url: article.url,
                summary: aiData.summary,
                sentiment: aiData.sentiment,
                topics: aiData.topics,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Update topic stats
            for (const topic of aiData.topics) {
                // Sanitize topic for document ID
                const safeTopicId = topic.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const topicRef = db.collection("topicStats").doc(safeTopicId);
                batch.set(topicRef, {
                    topic: topic,
                    frequency: admin.firestore.FieldValue.increment(1),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }

        await batch.commit();
        logger.info("Successfully processed and stored news articles.");

    } catch (error) {
        logger.error("Error fetching financial news:", error);
    }
});
