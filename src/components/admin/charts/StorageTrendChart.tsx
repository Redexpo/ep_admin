'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const mockData = [
    { name: 'Mon', storage: 120 },
    { name: 'Tue', storage: 150 },
    { name: 'Wed', storage: 180 },
    { name: 'Thu', storage: 210 },
    { name: 'Fri', storage: 250 },
    { name: 'Sat', storage: 280 },
    { name: 'Sun', storage: 320 },
];

const chartConfig = {
    storage: {
        label: "Storage Used (GB)",
        color: "#f59e0b",
    },
};

export function StorageTrendChart({ isDarkMode }: { isDarkMode: boolean }) {
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
                    Storage Utilization
                </h3>
                <p className="text-[12px] text-[#64748B]">Capacity trends and infrastructure load</p>
            </div>

            <div className="flex-1 min-h-[180px]">
                <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                    <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
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
                        <Area
                            type="monotone"
                            dataKey="storage"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorStorage)"
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
        </div>
    );
}
