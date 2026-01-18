import React, { useEffect, useState } from 'react';
import { fetchAnalytics } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, Award } from 'lucide-react';
import RevisionHeatmap from '../components/RevisionHeatmap';
import StreakTracker from '../components/StreakTracker';
import StatCard from '../components/StatCard';

const EnhancedAnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const data = await fetchAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Prepare chart data
    const difficultyData = [
        { name: 'Easy', value: analytics?.by_difficulty?.Easy || 0 },
        { name: 'Medium', value: analytics?.by_difficulty?.Medium || 0 },
        { name: 'Hard', value: analytics?.by_difficulty?.Hard || 0 }
    ];

    const topicData = Object.entries(analytics?.by_topic || {}).map(([name, count]) => ({
        name,
        count
    })).slice(0, 8);

    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    // Mock revision data for heatmap (you'll get this from API)
    const mockRevisions = [
        { revised_at: new Date() },
        { revised_at: new Date(Date.now() - 86400000) },
        { revised_at: new Date(Date.now() - 2 * 86400000) },
    ];

    return (
        <div className="min-h-screen p-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-5xl font-bold text-gradient mb-2">Analytics Dashboard</h1>
                <p className="text-white/60">Track your progress and identify areas for improvement</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon="📚"
                    label="Total Problems"
                    value={analytics?.total_problems || 0}
                    color="primary"
                    delay={0}
                />
                <StatCard
                    icon="✅"
                    label="Problems Solved"
                    value={analytics?.total_solved || 0}
                    color="success"
                    delay={0.1}
                />
                <StatCard
                    icon="🔄"
                    label="Total Revisions"
                    value={analytics?.most_revised?.reduce((sum, p) => sum + p.revision_count, 0) || 0}
                    color="secondary"
                    delay={0.2}
                />
                <StatCard
                    icon="🎯"
                    label="Accuracy Rate"
                    value={92}
                    suffix="%"
                    color="warning"
                    delay={0.3}
                />
            </div>

            {/* Streak Tracker */}
            <div className="mb-8">
                <StreakTracker
                    streak={analytics?.revision_streak || 0}
                    longestStreak={Math.max(analytics?.revision_streak || 0, 15)}
                />
            </div>

            {/* Heatmap */}
            <div className="mb-8">
                <RevisionHeatmap revisions={analytics?.all_revisions || []} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Difficulty Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-2xl font-bold mb-6">Difficulty Distribution</h3>
                    {analytics?.total_problems > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={difficultyData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                    outerRadius={80}
                                    innerRadius={50}
                                    fill="#8884d8"
                                    dataKey="value"
                                    animationDuration={800}
                                >
                                    {difficultyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1C1C1E',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-white/40">
                            <div className="text-6xl mb-4">📊</div>
                            <p>No problems added yet</p>
                        </div>
                    )}
                </motion.div>

                {/* Topic Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-2xl font-bold mb-6">Topics Covered</h3>
                    {topicData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topicData}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.5} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgba(255,255,255,0.6)"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="rgba(255,255,255,0.6)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1C1C1E',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="count" fill="url(#colorBar)" radius={[8, 8, 0, 0]} animationDuration={800} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-white/40">
                            <div className="text-6xl mb-4">🏷️</div>
                            <p>Track problems across different topics</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Most Revised Problems */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6"
            >
                <h3 className="text-2xl font-bold mb-6">Most Revised Problems</h3>
                {analytics?.most_revised && analytics.most_revised.length > 0 ? (
                    <div className="space-y-4">
                        {analytics.most_revised.slice(0, 5).map((problem, index) => (
                            <motion.div
                                key={problem.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl font-bold text-gradient">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{problem.title}</div>
                                        <div className="text-sm text-white/60">
                                            {problem.revision_count} revisions
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {Array(Math.min(5, problem.revision_count)).fill(0).map((_, i) => (
                                        <div key={i} className="w-2 h-8 bg-primary rounded-sm"></div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-white/40">
                        <div className="text-6xl mb-4">🎯</div>
                        <p>Start revising problems to track your progress</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EnhancedAnalyticsPage;
