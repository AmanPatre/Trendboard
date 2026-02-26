'use client';

import { useAuth } from '@/components/AuthProvider';
import { signInWithGoogle, signOut, signInWithEmail, signUpWithEmail } from '@/firebase/auth';
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


  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    async function loadInitialNews() {
      setFetching(true);
      const { articles: fetchedData } = await fetchNewsArticles(undefined, searchQuery, activeCategory);
      setArticles(fetchedData);
      setFetching(false);
    }


    const timer = setTimeout(() => {
      if (user) loadInitialNews();
    }, 300);

    return () => clearTimeout(timer);
  }, [user, activeCategory, searchQuery]);


  if (loading) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      if (isLoginMode) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (error: any) {
      console.error("Auth error", error);
      let errorMessage = 'Authentication failed. Please check your credentials.';


      if (error.message) {
        const match = error.message.match(/Firebase: (.*?)\s*\(/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'An account already exists with this email.';
        }
      }

      setAuthError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center p-4">
        <main className="max-w-md w-full flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Trendboard.</h1>
            <p className="text-zinc-600 dark:text-zinc-400">AI-powered financial intelligence</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full overflow-hidden">

            { }
            <div className="flex border-b border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => { setIsLoginMode(true); setAuthError(''); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${isLoginMode ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLoginMode(false); setAuthError(''); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${!isLoginMode ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                Create Account
              </button>
            </div>

            <div className="p-8 space-y-6">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    placeholder="••••••••"
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isAuthenticating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    isLoginMode ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs text-zinc-500 uppercase">
                  <span className="bg-white dark:bg-zinc-900 px-2">Or continue with</span>
                </div>
              </div>

              <button
                onClick={signInWithGoogle}
                disabled={isAuthenticating}
                className="w-full py-2.5 px-4 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl font-medium transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      { }
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
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

        { }
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

        { }
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
          { }
          <div className="order-2 lg:order-1 lg:col-span-3 space-y-6">
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

          { }
          <div className="order-1 lg:order-2 lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-6 w-full">
            <div className="flex-1">
              <IpoHeatTracker />
            </div>
            <div className="flex-1">
              <TrendingTopicsChart />
            </div>
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

