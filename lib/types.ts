export type Sentiment = -1 | 0 | 1;

export interface NewsArticle {
    id: string; // Document ID from Firestore
    title: string;
    source: string;
    category: string;
    summary: string;
    sentiment: Sentiment;
    topics: string[];
    explanation?: string;
    url: string;
    createdAt: any; // Firestore Timestamp
}

export interface TopicStat {
    id: string; // Document ID (topic string lowercased)
    topic: string;
    frequency: number;
    lastUpdated: any; // Firestore Timestamp
}
