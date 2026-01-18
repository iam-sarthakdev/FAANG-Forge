import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, TrendingUp, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { fetchReminders, fetchAnalytics } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [reminders, setReminders] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [remindersData, analyticsData] = await Promise.all([
                fetchReminders(),
                fetchAnalytics()
            ]);
            setReminders(Array.isArray(remindersData) ? remindersData : (remindersData.reminders || []));
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate weekly activity
    const getWeeklyActivity = () => {
        if (!analytics?.all_revisions) return [];

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i));
            return {
                day: days[date.getDay()],
                date: date.toISOString().split('T')[0],
                count: 0
            };
        });

        analytics.all_revisions.forEach(rev => {
            const revDate = new Date(rev.revised_at).toISOString().split('T')[0];
            const dayData = last7Days.find(d => d.date === revDate);
            if (dayData) dayData.count++;
        });

        return last7Days;
    };

    const weeklyData = getWeeklyActivity();
    const maxCount = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.count), 1) : 1;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const upcomingReminders = (reminders || []).filter(r => r.status === 'pending').slice(0, 3);
    const overdueCount = (reminders || []).filter(r => r.status === 'overdue').length;

    return (
        <div className="min-h-screen p-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-5xl font-bold text-gradient mb-2">Dashboard</h1>
                <p className="text-white/60">Track your coding journey</p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => navigate('/problems')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                        </div>
                        <TrendingUp className="text-blue-400" size={20} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{analytics?.total_problems || 0}</div>
                    <div className="text-white/60 text-sm">Total Problems</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => navigate('/problems')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="text-green-400" size={24} />
                        </div>
                        <div className="text-xs text-green-400">
                            {analytics?.total_problems > 0
                                ? Math.round((analytics?.total_solved / analytics?.total_problems) * 100)
                                : 0}%
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{analytics?.total_solved || 0}</div>
                    <div className="text-white/60 text-sm">Problems Solved</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 hover:scale-105 transition-transform"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <span className="text-2xl">🔄</span>
                        </div>
                        <div className="text-xs text-purple-400">
                            {analytics?.revision_streak || 0} day streak
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {analytics?.most_revised?.reduce((sum, p) => sum + p.revision_count, 0) || 0}
                    </div>
                    <div className="text-white/60 text-sm">Total Revisions</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 hover:scale-105 transition-transform"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <Clock className="text-orange-400" size={24} />
                        </div>
                        {overdueCount > 0 && (
                            <div className="text-xs text-orange-400">
                                {overdueCount} overdue
                            </div>
                        )}
                    </div>
                    <div className="text-3xl font-bold mb-1">{reminders?.length || 0}</div>
                    <div className="text-white/60 text-sm">Active Reminders</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Weekly Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                        <Calendar className="mr-2" size={24} />
                        Weekly Activity
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData}>
                            <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                            <YAxis stroke="rgba(255,255,255,0.6)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1C1C1E',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                {weeklyData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.count > 0 ? '#6366f1' : 'rgba(255,255,255,0.1)'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Upcoming Reminders */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-2xl font-bold mb-4">Upcoming Reminders</h3>
                    {upcomingReminders.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingReminders.map((reminder, index) => (
                                <motion.div
                                    key={reminder.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    onClick={() => navigate(`/problems/${reminder.id}`)}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                                >
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm">{reminder.title}</div>
                                        <div className="text-xs text-white/60 mt-1">
                                            {new Date(reminder.next_reminder_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <  ArrowRight className="text-white/40 group-hover:text-primary transition-colors" size={16} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-white/40">
                            <Calendar size={48} className="mb-2" />
                            <p>No upcoming reminders</p>
                        </div>
                    )}
                    {upcomingReminders.length > 0 && (
                        <button
                            onClick={() => navigate('/problems')}
                            className="w-full mt-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                            View All
                        </button>
                    )}
                </motion.div>
            </div>

            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                onClick={() => navigate('/problems/new')}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group z-50"
                whileHover={{ rotate: 90 }}
            >
                <Plus size={28} className="text-white" />
                <div className="absolute right-20 bg-black/90 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Add Problem
                </div>
            </motion.button>
        </div>
    );
};

export default DashboardPage;
