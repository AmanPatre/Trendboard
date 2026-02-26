'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Flame } from 'lucide-react';

interface TopicStat {
    topic: string;
    frequency: number;
    lastUpdated: any;
}

export function IpoHeatTracker() {
    const [heat, setHeat] = useState<TopicStat | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'topicStats', 'ipo-heat'), (doc) => {
            if (doc.exists()) {
                setHeat(doc.data() as TopicStat);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!heat || heat.frequency === 0) return null;

    // Calculate intensity based on arbitrary threshold for prototype
    const getIntensity = () => {
        if (heat.frequency > 10) return { level: 'High', color: 'bg-orange-500', text: 'text-orange-500', rings: 3 };
        if (heat.frequency > 5) return { level: 'Medium', color: 'bg-amber-500', text: 'text-amber-500', rings: 2 };
        return { level: 'Low', color: 'bg-yellow-500', text: 'text-yellow-500', rings: 1 };
    };

    const intensity = getIntensity();

    return (
        <div className="flex flex-col p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 border border-orange-200/50 dark:border-orange-900/30 rounded-2xl shadow-sm relative overflow-hidden">

            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className={`p-2 bg-white dark:bg-black rounded-lg shadow-sm border border-orange-100 dark:border-orange-900 relative`}>
                        <Flame className={`w-5 h-5 ${intensity.text}`} />
                        {/* Simple heat ripple effect */}
                        <div className="absolute inset-0 rounded-lg bg-orange-500/20 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-orange-900 dark:text-orange-200">IPO Radar</h3>
                        <p className="text-xs font-medium text-orange-700/70 dark:text-orange-400/70">Mention frequency</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className={`text-2xl font-black ${intensity.text} tracking-tight`}>
                        {heat.frequency}
                    </div>
                </div>
            </div>

            <div className="mt-4 z-10">
                <div className="w-full bg-orange-200/50 dark:bg-orange-900/40 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-1.5 rounded-full ${intensity.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min((heat.frequency / 20) * 100, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[10px] font-bold text-orange-800/60 dark:text-orange-500/60 uppercase tracking-widest">
                    <span>Low</span>
                    <span className={intensity.text}>{intensity.level} Heat</span>
                    <span>High</span>
                </div>
            </div>

            {/* Decorative background mesh */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/10 dark:bg-orange-500/5 blur-2xl rounded-full pointer-events-none" />
        </div>
    );
}
