'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TopicStat {
    topic: string;
    frequency: number;
}

export function TrendingTopicsChart() {
    const [data, setData] = useState<TopicStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const q = query(
            collection(db, 'topicStats'),
            orderBy('frequency', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs
                .map(doc => doc.data() as TopicStat)
                .filter(stat => !stat.topic.toLowerCase().includes('ipo')) 
                .slice(0, 5) 
                .reverse(); 

            setData(fetchedData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm h-72 flex flex-col items-center justify-center animate-pulse">
                <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded mb-4 w-3/4"></div>
                <div className="flex-grow w-full bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-100 dark:border-zinc-800"></div>
            </div>
        )
    }

    if (data.length === 0) return null;

    return (
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm h-72 flex flex-col relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-4 z-10">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                    <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Trending Topics</h3>
            </div>

            <div className="flex-grow z-10 w-full h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorFrequency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="topic"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#71717a' }}
                            dy={10}
                        />
                        <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax * 1.5, 5)]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '12px'
                            }}
                            itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="frequency"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorFrequency)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

