import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();
const db = admin.firestore();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "demo";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

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

const SYSTEM_PROMPT = `
You are an expert financial analyst. Analyze the following news article text.
ALL output MUST be in English. If the original text is in another language, translate it to English first.
Return JSON ONLY strictly matching this schema:
{
  "title": "The article headline translated to English (or cleanly formatted if already English)",
  "summary": "1-2 sentence concise summary of the actual news event in English",
  "sentiment": number (-1 for bearish/negative, 0 for neutral, 1 for bullish/positive),
  "topics": ["Keyword1", "Keyword2", "Keyword3"] (Maximum 3 core financial/company topics in English)
}
No markdown, no explanation, only raw JSON.
`;

export const fetchFinancialNews = onSchedule("every 1 hours", async (event) => {
    try {
        logger.info("Starting scheduled news fetch...");

        const categoriesToFetch = ['general', 'crypto', 'forex', 'merger'];
        let allArticles: FinnhubNewsItem[] = [];

        for (const cat of categoriesToFetch) {
            try {
                const response = await axios.get<FinnhubNewsItem[]>(
                    `https://finnhub.io/api/v1/news?category=${cat}&token=${FINNHUB_API_KEY}`
                );
                allArticles = [...allArticles, ...response.data.slice(0, 3)];
            } catch (err) {
                logger.error(`Error fetching category ${cat}:`, err);
            }
        }

        const batch = db.batch();

        let totalSentiment = 0;
        let articleCount = 0;
        let ipoMentions = 0;

        for (const article of allArticles) {
            const docRef = db.collection("newsArticles").doc(article.id.toString());
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                continue;
            }

            const promptText = `Headline: ${article.headline}\nContent: ${article.summary}`;

            let aiData = { title: article.headline, summary: article.summary, sentiment: 0, topics: ["General"] };

            if (GEMINI_API_KEY) {
                try {
                    const model = ai.getGenerativeModel({
                        model: "gemini-2.5-flash",
                        systemInstruction: SYSTEM_PROMPT,
                        generationConfig: {
                            temperature: 0.1,
                            responseMimeType: "application/json"
                        }
                    });

                    const aiResponse = await model.generateContent(promptText);
                    const text = aiResponse.response.text();
                    if (text) {
                        aiData = JSON.parse(text);
                    }
                } catch (aiError) {
                    logger.error("AI Processing error for article", article.id, aiError);
                }
            }

            totalSentiment += aiData.sentiment;
            articleCount++;

            const isIpoRelated =
                aiData.topics.some(t => t.toLowerCase().includes('ipo')) ||
                article.headline.toLowerCase().includes('ipo') ||
                article.summary.toLowerCase().includes('ipo');

            if (isIpoRelated) ipoMentions++;

            batch.set(docRef, {
                title: aiData.title || article.headline,
                source: article.source,
                category: article.category,
                url: article.url,
                summary: aiData.summary,
                sentiment: aiData.sentiment,
                topics: aiData.topics,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            for (const topic of aiData.topics) {
                const safeTopicId = topic.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const topicRef = db.collection("topicStats").doc(safeTopicId);
                batch.set(topicRef, {
                    topic: topic,
                    frequency: admin.firestore.FieldValue.increment(1),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }

        if (articleCount > 0) {
            const averageSentiment = totalSentiment / articleCount;
            const pulseScore = averageSentiment * Math.log1p(articleCount);

            let pulseLabel = "Neutral";
            if (pulseScore > 0.5) pulseLabel = "Bullish";
            if (pulseScore < -0.5) pulseLabel = "Bearish";

            const pulseRef = db.collection("marketPulse").doc("latest");
            batch.set(pulseRef, {
                score: pulseScore,
                label: pulseLabel,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                basedOnCount: articleCount
            });

            if (ipoMentions > 0) {
                const ipoRef = db.collection("topicStats").doc("ipo-heat");
                batch.set(ipoRef, {
                    topic: "IPO Activity",
                    frequency: admin.firestore.FieldValue.increment(ipoMentions),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    isSpecialTracking: true
                }, { merge: true });
            }
        }

        await batch.commit();
        logger.info("Successfully processed and stored news articles.");

    } catch (error) {
        logger.error("Error fetching financial news:", error);
    }
});

import { onCall, HttpsError } from "firebase-functions/v2/https";

export const explainTrend = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in to request explanations.');
    }

    const { articleId, textToExplain } = request.data;
    if (!articleId || !textToExplain) {
        throw new HttpsError('invalid-argument', 'Missing articleId or textToExplain.');
    }

    try {
        const prompt = `
            You are a senior financial advisor. Explain why the following news matters to an investor.
            News: "${textToExplain}"
            
            Return JSON strictly matching this schema:
            {
               "bullets": ["Point 1", "Point 2", "Point 3"],
               "shortTermImpact": "1 sentence on short term impact",
               "longTermImpact": "1 sentence on long term impact"
            }
        `;

        const model = ai.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.3,
                responseMimeType: "application/json"
            }
        });

        const aiResponse = await model.generateContent(prompt);
        const explanationText = aiResponse.response.text();

        if (!explanationText) {
            throw new Error("No response from AI");
        }

        const explanationObj = JSON.parse(explanationText);

        await db.collection("newsArticles").doc(articleId).update({
            explanation: explanationObj
        });

        return explanationObj;

    } catch (error) {
        logger.error("Error explaining trend:", error);
        throw new HttpsError('internal', 'Failed to generate explanation.');
    }
});
