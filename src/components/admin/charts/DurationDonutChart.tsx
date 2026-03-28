'use client';

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DurationStats } from '@/services/admin/dashboardService';
import { Activity } from 'lucide-react';

interface DurationDonutChartProps {
    isDarkMode: boolean;
    data: DurationStats[];
    isLoading: boolean;
}

export function DurationDonutChart({ isDarkMode, data, isLoading }: DurationDonutChartProps) {
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
                    Video Duration
                </h3>
                <p className="text-[12px] text-[#64748B]">Distribution of recording lengths</p>
            </div>

            <div className="flex-1 min-h-[180px] flex items-center justify-center">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl animate-pulse">
                        <Activity className="text-slate-200" size={48} />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
