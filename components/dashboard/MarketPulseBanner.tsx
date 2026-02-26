'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface MarketPulseData {
    score: number;
    label: 'Bullish' | 'Neutral' | 'Bearish';
    updatedAt: any;
    basedOnCount: number;
}

export function MarketPulseBanner() {
    const [pulse, setPulse] = useState<MarketPulseData | null>(null);

    useEffect(() => {
        
        const unsubscribe = onSnapshot(doc(db, 'marketPulse', 'latest'), (doc) => {
            if (doc.exists()) {
                setPulse(doc.data() as MarketPulseData);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!pulse) return null;

    const getStyleAndIcon = () => {
        switch (pulse.label) {
            case 'Bullish':
                return {
                    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                    border: 'border-emerald-200 dark:border-emerald-900/50',
                    text: 'text-emerald-700 dark:text-emerald-400',
                    icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                };
            case 'Bearish':
                return {
                    bg: 'bg-rose-50 dark:bg-rose-950/30',
                    border: 'border-rose-200 dark:border-rose-900/50',
                    text: 'text-rose-700 dark:text-rose-400',
                    icon: <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                };
            default:
                return {
                    bg: 'bg-zinc-50 dark:bg-zinc-900',
                    border: 'border-zinc-200 dark:border-zinc-800',
                    text: 'text-zinc-700 dark:text-zinc-300',
                    icon: <Minus className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                };
        }
    };

    const style = getStyleAndIcon();

    return (
        <div className={`w-full rounded-2xl border ${style.border} ${style.bg} p-4 flex items-center justify-between mb-8 shadow-sm transition-colors duration-500 relative overflow-hidden group`}>
            {}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-current opacity-5 rounded-full blur-xl group-hover:animate-pulse pointer-events-none" style={{ color: style.text.split(' ')[0].replace('text-', '') }} />

            <div className="flex items-center gap-4 z-10">
                <div className={`p-3 bg-white dark:bg-black rounded-xl shadow-sm border ${style.border} flex items-center justify-center`}>
                    <Activity className={`w-6 h-6 ${style.text}`} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Market Pulse</h2>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-black border ${style.border} flex items-center gap-1.5`}>
                            {style.icon}
                            <span className={style.text}>{pulse.label}</span>
                        </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium flex items-center gap-1.5">
                        Based on sentiment analysis of {pulse.basedOnCount} recent articles
                    </p>
                </div>
            </div>

            <div className="text-right z-10 hidden sm:block">
                <div className="text-3xl font-black tracking-tighter" style={{ color: style.text.split(' ')[0].replace('text-', '') }}>
                    {pulse.score > 0 ? '+' : ''}{pulse.score.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Composite Score</div>
            </div>
        </div>
    );
}

