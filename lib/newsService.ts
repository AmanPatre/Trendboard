import { db } from '@/firebase/config';
import { collection, query, orderBy, limit, getDocs, where, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { NewsArticle } from '@/lib/types';

const ARTICLES_PER_PAGE = 10;

export async function fetchNewsArticles(
    lastDoc?: QueryDocumentSnapshot,
    searchQuery?: string,
    categoryFilter?: string
) {
    try {
        let q = query(
            collection(db, 'newsArticles'),
            orderBy('createdAt', 'desc')
        );

        if (categoryFilter && categoryFilter !== 'All') {
            q = query(q, where('category', '==', categoryFilter));
        }

        // Note: Firestore doesn't support full-text search natively well without external providers (Algolia). 
        // For a minimal prototype, we'll fetch recently and filter client-side if a search query exists, 
        // or limit the initial fetch.
        if (!searchQuery) {
            q = query(q, limit(ARTICLES_PER_PAGE));
        } else {
            // If searching, we might need to fetch more and filter in memory for this simple implementation
            q = query(q, limit(50));
        }

        if (lastDoc && !searchQuery) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);

        let articles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as NewsArticle[];

        // Simple client-side search filtering
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            articles = articles.filter(a =>
                a.title.toLowerCase().includes(lowerQuery) ||
                a.summary.toLowerCase().includes(lowerQuery) ||
                a.topics.some(t => t.toLowerCase().includes(lowerQuery))
            );
            articles = articles.slice(0, ARTICLES_PER_PAGE); // Paginate the filtered results
        }

        const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

        return { articles, lastDoc: newLastDoc };
    } catch (error) {
        console.error("Error fetching news articles:", error);
        return { articles: [], lastDoc: undefined };
    }
}
