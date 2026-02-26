'use client';

import { useAuth } from '@/components/AuthProvider';
import { signInWithGoogle, signOut } from '@/firebase/auth';
import { ArticleCard } from '@/components/dashboard/ArticleCard';
import { useEffect, useState } from 'react';
import { NewsArticle } from '@/lib/types';
import { fetchNewsArticles } from '@/lib/newsService';
import { Search, TrendingUp } from 'lucide-react';
import { MarketPulseBanner } from '@/components/dashboard/MarketPulseBanner';
import { IpoHeatTracker } from '@/components/dashboard/IpoHeatTracker';
import { ExplainTrendModal } from '@/components/dashboard/ExplainTrendModal';
import { TrendingTopicsChart } from '@/components/dashboard/TrendingTopicsChart';

const CATEGORIES = ["All", "General", "Crypto", "Forex", "Merger"];

export default function Home() {
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [explainingArticle, setExplainingArticle] = useState<{ id: string, text: string, cached?: any } | null>(null);

  useEffect(() => {
    async function loadInitialNews() {
      setFetching(true);
      const { articles: fetchedData } = await fetchNewsArticles(undefined, searchQuery, activeCategory);
      setArticles(fetchedData);
      setFetching(false);
    }

    // Simple debounce for search
    const timer = setTimeout(() => {
      if (user) loadInitialNews();
    }, 300);

    return () => clearTimeout(timer);
  }, [user, activeCategory, searchQuery]);


  if (loading) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center p-8">Loading...</div>;
  }

  if (!user) {
    // ... Login UI ... (keeping existing for brevity, simplified below)
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center p-8">
        <main className="max-w-xl w-full flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Trendboard</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">AI-powered financial intelligence dashboard</p>
          <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full">
            <p className="text-zinc-600 dark:text-zinc-400">Sign in to access your customized dashboard.</p>
            <button onClick={signInWithGoogle} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              Continue with Google
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Trendboard.</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block text-zinc-600 dark:text-zinc-400">{user.email}</span>
            <button onClick={signOut} className="text-sm px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <MarketPulseBanner />

        {/* Top Controls: Search & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search markets, companies, topics..."
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main News Feed */}
          <div className="lg:col-span-3 space-y-6">
            {fetching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onExplainClick={(id) => setExplainingArticle({
                      id,
                      text: `${article.title}. ${article.summary}`,
                      cached: article.explanation
                    })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500">No news articles found for your criteria.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <IpoHeatTracker />
            <TrendingTopicsChart />
          </div>
        </div>
      </main>

      {explainingArticle && (
        <ExplainTrendModal
          articleId={explainingArticle.id}
          textToExplain={explainingArticle.text}
          cachedExplanation={explainingArticle.cached}
          onClose={() => setExplainingArticle(null)}
        />
      )}
    </div>
  );
}
