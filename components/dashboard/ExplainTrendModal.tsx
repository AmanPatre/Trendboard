'use client';

import { useState } from 'react';
import { functions } from '@/firebase/config';
import { httpsCallable } from 'firebase/functions';
import { Sparkles, X, ChevronRight } from 'lucide-react';

interface ExplainModalProps {
    articleId: string;
    textToExplain: string;
    onClose: () => void;
    cachedExplanation?: any;
}

export function ExplainTrendModal({ articleId, textToExplain, onClose, cachedExplanation }: ExplainModalProps) {
    const [loading, setLoading] = useState(!cachedExplanation);
    const [explanation, setExplanation] = useState<any>(cachedExplanation || null);
    const [error, setError] = useState('');

    useState(() => {
        if (!cachedExplanation) {
            const explainTrend = httpsCallable(functions, 'explainTrend');
            explainTrend({ articleId, textToExplain })
                .then((result) => {
                    setExplanation(result.data);
                })
                .catch((err) => {
                    console.error(err);
                    setError('Failed to analyze this trend. Please try again.');
                })
                .finally(() => setLoading(false));
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">

                {}
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                        <Sparkles className="w-5 h-5" />
                        <span>AI Trend Analysis</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {}
                <div className="p-6">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-zinc-500">
                                <Sparkles className="w-5 h-5 animate-spin" />
                                <span className="font-medium animate-pulse">Analyzing market impact...</span>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-5/6 animate-pulse"></div>
                                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-4/6 animate-pulse"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-rose-500 p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-100 dark:border-rose-900/50">
                            {error}
                        </div>
                    ) : explanation ? (
                        <div className="space-y-6">

                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">Key Takeaways</h3>
                                <ul className="space-y-2">
                                    {explanation.bullets?.map((bullet: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                                            <ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                                    <h4 className="text-xs font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-2">Short-Term Impact</h4>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{explanation.shortTermImpact}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                                    <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-2">Long-Term Outlook</h4>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{explanation.longTermImpact}</p>

                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

