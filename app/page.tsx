'use client';

import { useAuth } from '@/components/AuthProvider';
import { signInWithGoogle, signOut } from '@/firebase/auth';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center p-8">
      <main className="max-w-xl w-full flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Trendboard</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            AI-powered financial intelligence dashboard
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="h-10 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        ) : user ? (
          <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full">
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Signed in as</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="px-6 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full">
            <p className="text-zinc-600 dark:text-zinc-400">
              Sign in to access your customized dashboard and preferences.
            </p>
            <button
              onClick={signInWithGoogle}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
