export type Sentiment = -1 | 0 | 1;

export interface NewsArticle {
    id: string; 
    title: string;
    source: string;
    category: string;
    summary: string;
    sentiment: Sentiment;
    topics: string[];
    explanation?: string;
    url: string;
    createdAt: any; 
}

export interface TopicStat {
    id: string; 
    topic: string;
    frequency: number;
    lastUpdated: any; 
}

