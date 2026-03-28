'use client';

import React from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const mockData = [
    { name: 'Mon', records: 45, views: 120 },
    { name: 'Tue', records: 52, views: 210 },
    { name: 'Wed', records: 38, views: 180 },
    { name: 'Thu', records: 65, views: 420 },
    { name: 'Fri', records: 48, views: 310 },
    { name: 'Sat', records: 25, views: 150 },
    { name: 'Sun', records: 32, views: 240 },
];

const chartConfig = {
    records: {
        label: "Videos Recorded",
        color: "#3b82f6",
    },
    views: {
        label: "Total Views",
        color: "#10b981",
    },
};

export function EngagementChart({ isDarkMode }: { isDarkMode: boolean }) {
    return (
        <div
            className="rounded-2xl p-6 shadow-sm flex flex-col h-[400px]"
            style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
            }}
        >
            <div className="mb-6">
                <h3 className="text-[18px] font-bold" style={{ color: isDarkMode ? '#ffffff' : '#0F172A' }}>
                    Content Engagement
                </h3>
                <p className="text-[12px] text-[#64748B]">Ratio of creation vs. consumption</p>
            </div>

            <div className="flex-1 min-h-[180px]">
                <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                    <ComposedChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Bar
                            dataKey="records"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                        <Line
                            type="monotone"
                            dataKey="views"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                        />
                    </ComposedChart>
                </ChartContainer>
            </div>
        </div>
    );
}
