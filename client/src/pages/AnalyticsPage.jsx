import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    AreaChart,
    Area,
    CartesianGrid
} from 'recharts';
import {
    TrendingUp,
    Target,
    Flame,
    Activity,
    Hash,
    Trophy,
    CheckCircle2,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAnalytics } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const data = await fetchAnalytics();
            setAnalytics(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Analyzing performance..." />;
    if (!analytics) return <div className="text-center text-slate-500 p-10">No analytics data available</div>;

    // Data Processing
    const difficultyData = Object.entries(analytics.by_difficulty).map(([key, value]) => ({
        name: key,
        value,
        color: key === 'Easy' ? '#10b981' : key === 'Medium' ? '#f59e0b' : '#ef4444'
    }));

    const topicData = Object.entries(analytics.by_topic)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([key, value]) => ({
            name: key,
            value
        }));

    // Use real weekly activity from API
    const activityData = analytics.weekly_activity || [];

    const completionPct = analytics.completion_pct || (
        analytics.total_problems > 0
            ? Math.round((analytics.total_solved / analytics.total_problems) * 100)
            : 0
    );

    const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#7c3aed', '#c084fc', '#9333ea', '#a855f7', '#7e22ce'];

    return (
        <div className="min-h-screen p-6 lg:p-10 max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-violet-600 rounded-lg">
                            <Activity className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
                    </div>
                    <p className="text-slate-500 text-sm ml-12">Deep dive into your coding journey and preparation stats.</p>
                </div>

                {/* Streak Badge */}
                <div className="hidden md:flex flex-col items-center bg-[#111113] border border-amber-500/20 px-5 py-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-0.5">
                        <Flame className="text-amber-500" size={16} />
                        <span className="text-amber-300/80 font-semibold uppercase text-[10px] tracking-wider">Current Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {analytics.revision_streak || 28} <span className="text-xs font-medium text-slate-500">DAYS</span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Problems', value: analytics.total_problems, icon: Hash, color: 'violet', sub: 'Indexed' },
                    { label: 'Problems Solved', value: analytics.total_solved || 0, icon: CheckCircle2, color: 'emerald', sub: 'Completed' },
                    { label: 'Total Revisions', value: analytics.total_revisions || 0, icon: TrendingUp, color: 'blue', sub: 'Sessions' },
                    { label: 'Completion', value: `${completionPct}%`, icon: Trophy, color: 'amber', sub: 'Of Goal' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className="bg-[#111113] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-lg ${stat.color === 'violet' ? 'bg-violet-500/10 text-violet-400' :
                                    stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                                        stat.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                                            'bg-amber-500/10 text-amber-400'
                                }`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-500 border border-white/[0.04]">
                                {stat.sub}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-0.5">{stat.value}</h3>
                        <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                {/* Activity Graph */}
                <div className="lg:col-span-8 bg-[#111113] border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                <BarChart3 size={16} className="text-violet-400" />
                                Preparation Activity
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Problems solved vs Revisions over the last week</p>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        {activityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRevised" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                                    <XAxis dataKey="day" stroke="transparent" fontSize={11} tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="transparent" fontSize={11} tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1c', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={30}
                                        iconType="circle"
                                        iconSize={8}
                                        wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                                    />
                                    <Area type="monotone" dataKey="solved" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSolved)" name="Problems Solved" />
                                    <Area type="monotone" dataKey="revised" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorRevised)" name="Revisions" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                                No activity data yet. Start solving and revising problems!
                            </div>
                        )}
                    </div>
                </div>

                {/* Difficulty Distribution */}
                <div className="lg:col-span-4 bg-[#111113] border border-white/[0.06] rounded-xl p-6 flex flex-col">
                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                        <Target size={16} className="text-rose-400" />
                        Difficulty Breakdown
                    </h3>
                    <div className="flex-1 min-h-[230px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={difficultyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {difficultyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1c', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={30} content={({ payload }) => (
                                    <div className="flex justify-center gap-4 text-[11px] font-medium text-slate-400 mt-2">
                                        {payload.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                {entry.value}
                                            </div>
                                        ))}
                                    </div>
                                )} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-10">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-white">{analytics.total_problems}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Topic Bar Chart */}
                <div className="lg:col-span-12 bg-[#111113] border border-white/[0.06] rounded-xl p-6">
                    <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                        <Hash size={16} className="text-violet-400" />
                        Top Problem Topics
                    </h3>
                    <div className="h-[220px] w-full">
                        {topicData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topicData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                                    <XAxis dataKey="name" stroke="transparent" fontSize={11} tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="transparent" fontSize={11} tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff03' }}
                                        contentStyle={{ backgroundColor: '#1a1a1c', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="value" radius={[3, 3, 0, 0]} barSize={28}>
                                        {topicData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                                No topic data yet. Add problems with topics to see distribution.
                            </div>
                        )}
                    </div>
                </div>

                {/* Most Revised List */}
                <div className="lg:col-span-12 bg-[#111113] border border-white/[0.06] rounded-xl p-6">
                    <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                        <TrendingUp size={16} className="text-emerald-400" />
                        Most Revised Problems
                    </h3>

                    {analytics.most_revised.length === 0 ? (
                        <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.06]">
                            <TrendingUp className="mx-auto h-10 w-10 text-slate-700 mb-2" />
                            <p className="text-slate-500 text-sm">Not enough data yet. Start revising!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {analytics.most_revised.map((problem, index) => (
                                <div
                                    key={problem.id || index}
                                    className="flex items-center justify-between p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            flex items-center justify-center w-7 h-7 rounded-md font-bold text-xs
                                            ${index === 0 ? 'bg-yellow-500/15 text-yellow-400' :
                                                index === 1 ? 'bg-slate-400/15 text-slate-300' :
                                                    index === 2 ? 'bg-orange-700/15 text-orange-400' :
                                                        'bg-white/[0.04] text-slate-500'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm text-white truncate block max-w-[180px]">{problem.title}</span>
                                            {problem.section && (
                                                <span className="text-[10px] text-slate-500">{problem.section}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 text-xs font-semibold">
                                        <TrendingUp size={10} />
                                        {problem.revision_count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
