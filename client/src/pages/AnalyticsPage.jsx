import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, Target, Award, Flame } from 'lucide-react';
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

    if (loading) return <LoadingSpinner message="Loading analytics..." />;
    if (!analytics) return <div>No data available</div>;

    // Prepare data for charts
    const difficultyData = Object.entries(analytics.by_difficulty).map(([key, value]) => ({
        name: key,
        value
    }));

    const topicData = Object.entries(analytics.by_topic).map(([key, value]) => ({
        name: key,
        value
    }));

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="glass-card p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/60 text-sm mb-1">{label}</p>
                    <p className="text-4xl font-bold">{value}</p>
                </div>
                <div className={`bg-${color}-500/20 p-4 rounded-lg`}>
                    <Icon className={`w-8 h-8 text-${color}-400`} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gradient mb-2">Analytics</h1>
                <p className="text-white/60">Track your DSA preparation progress</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Target}
                    label="Total Problems"
                    value={analytics.total_problems}
                    color="primary"
                />
                <StatCard
                    icon={Award}
                    label="Easy"
                    value={analytics.by_difficulty.Easy || 0}
                    color="green"
                />
                <StatCard
                    icon={Award}
                    label="Medium"
                    value={analytics.by_difficulty.Medium || 0}
                    color="yellow"
                />
                <StatCard
                    icon={Award}
                    label="Hard"
                    value={analytics.by_difficulty.Hard || 0}
                    color="red"
                />
            </div>

            {/* Revision Streak */}
            <div className="glass-card p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Flame className="w-6 h-6 text-orange-400" />
                    <h2 className="text-2xl font-bold">Revision Streak</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-6xl font-bold text-gradient">
                        {analytics.revision_streak}
                    </div>
                    <div className="text-white/60">
                        {analytics.revision_streak === 1 ? 'day' : 'days'} in a row 🔥
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Difficulty Distribution */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Problems by Difficulty</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={difficultyData}>
                            <XAxis dataKey="name" stroke="#fff" opacity={0.6} />
                            <YAxis stroke="#fff" opacity={0.6} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Topic Distribution */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Problems by Topic</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={topicData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {topicData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Most Revised Problems */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Most Revised Problems</h2>
                </div>
                {analytics.most_revised.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No revisions yet</p>
                ) : (
                    <div className="space-y-3">
                        {analytics.most_revised.map((problem, index) => (
                            <div
                                key={problem.id}
                                className="flex items-center justify-between bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-r from-primary to-secondary w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                                        #{index + 1}
                                    </div>
                                    <span className="font-semibold">{problem.title}</span>
                                </div>
                                <span className="bg-primary/20 text-primary px-4 py-2 rounded-full font-semibold">
                                    {problem.revision_count} revisions
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
