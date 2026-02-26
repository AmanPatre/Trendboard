import { NewsArticle } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ArticleCardProps {
    article: NewsArticle;
    onExplainClick?: (articleId: string) => void;
}

export function ArticleCard({ article, onExplainClick }: ArticleCardProps) {
    const getSentimentIcon = () => {
        switch (article.sentiment) {
            case 1:
                return <TrendingUp className="w-4 h-4 text-emerald-500" />;
            case -1:
                return <TrendingDown className="w-4 h-4 text-rose-500" />;
            default:
                return <Minus className="w-4 h-4 text-zinc-400" />;
        }
    };

    const getSentimentLabel = () => {
        switch (article.sentiment) {
            case 1:
                return "Bullish";
            case -1:
                return "Bearish";
            default:
                return "Neutral";
        }
    }

    return (
        <div className="flex flex-col p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full">
                    {article.source || "General"}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 dark:bg-black rounded-full border border-zinc-100 dark:border-zinc-800">
                    {getSentimentIcon()}
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {getSentimentLabel()}
                    </span>
                </div>
            </div>

            <a href={article.url} target="_blank" rel="noopener noreferrer" className="block mt-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                </h3>
            </a>

            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 flex-grow">
                {article.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
                {article.topics.slice(0, 3).map((topic, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md">
                        #{topic}
                    </span>
                ))}
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                    {article.createdAt?.seconds
                        ? formatDistanceToNow(new Date(article.createdAt.seconds * 1000), { addSuffix: true })
                        : 'Recently'}
                </span>
                <button
                    onClick={() => onExplainClick?.(article.id)}
                    className="text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                    Explain Why This Matters
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
