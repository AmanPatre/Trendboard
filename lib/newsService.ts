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

        
        

        
        
        
        if (!searchQuery && (!categoryFilter || categoryFilter === 'All')) {
            q = query(q, limit(ARTICLES_PER_PAGE));
        } else {
            
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

        
        if (categoryFilter && categoryFilter !== 'All') {
            const lowerCat = categoryFilter.toLowerCase();
            articles = articles.filter(a => {
                const matchesDirect = a.topics.some(t => t.toLowerCase().includes(lowerCat)) ||
                    a.title.toLowerCase().includes(lowerCat) ||
                    a.summary.toLowerCase().includes(lowerCat) ||
                    a.category.toLowerCase().includes(lowerCat);

                
                if (lowerCat === 'general') {
                    const isSpecialized = ['crypto', 'forex', 'merger'].includes(a.category.toLowerCase());
                    return matchesDirect || !isSpecialized;
                }

                return matchesDirect;
            });
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            articles = articles.filter(a =>
                a.title.toLowerCase().includes(lowerQuery) ||
                a.summary.toLowerCase().includes(lowerQuery) ||
                a.topics.some(t => t.toLowerCase().includes(lowerQuery))
            );
        }

        if (searchQuery || (categoryFilter && categoryFilter !== 'All')) {
            articles = articles.slice(0, ARTICLES_PER_PAGE); 
        }

        const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

        return { articles, lastDoc: newLastDoc };
    } catch (error) {
        console.error("Error fetching news articles:", error);
        return { articles: [], lastDoc: undefined };
    }
}

