import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Calendar,
    TrendingUp,
    CheckCircle,
    Clock,
    ArrowRight,
    Code2,
    Activity,
    BarChart3,
    MessageCircle,
    Star,
    X
} from 'lucide-react';
import { fetchReminders, fetchAnalytics, feedbackAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid
} from 'recharts';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [reminders, setReminders] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackRole, setFeedbackRole] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoadError(null);
            const [remindersData, analyticsData] = await Promise.all([
                fetchReminders(),
                fetchAnalytics()
            ]);
            setReminders(Array.isArray(remindersData) ? remindersData : (remindersData.reminders || []));
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            setLoadError('Failed to load dashboard data. The server may be starting up.');
        } finally {
            setLoading(false);
        }
    };

    // Use weekly_activity from API, fallback to computing from all_revisions
    const getWeeklyActivity = () => {
        if (analytics?.weekly_activity) return analytics.weekly_activity;

        if (!analytics?.all_revisions) return [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i));
            return {
                day: days[date.getDay()],
                date: date.toISOString().split('T')[0],
                solved: 0,
                revised: 0
            };
        });

        analytics.all_revisions.forEach(rev => {
            const revDate = new Date(rev.revised_at).toISOString().split('T')[0];
            const dayData = last7Days.find(d => d.date === revDate);
            if (dayData) dayData.revised++;
        });

        return last7Days;
    };

    const weeklyData = getWeeklyActivity();
    const upcomingReminders = (reminders || []).filter(r => r.status === 'pending').slice(0, 3);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-500 text-sm">Loading dashboard...</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] gap-4">
                <p className="text-red-400 text-sm">{loadError}</p>
                <button
                    onClick={() => { setLoading(true); setLoadError(null); loadDashboardData(); }}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-10 max-w-[1400px] mx-auto pb-32">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-violet-600 rounded-lg">
                        <Activity className="text-white" size={20} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                </div>
                <p className="text-slate-500 text-sm ml-12">Your automated coding growth engine.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Problems */}
                <div
                    onClick={() => navigate('/problems')}
                    className="bg-[#111113] border border-white/[0.06] rounded-xl p-5 cursor-pointer hover:border-violet-500/20 transition-colors group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Code2 className="text-violet-400" size={18} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-0.5">
                        {analytics?.total_problems || 0}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Total Problems</p>
                </div>

                {/* Problems Solved */}
                <div
                    onClick={() => navigate('/problems')}
                    className="bg-[#111113] border border-white/[0.06] rounded-xl p-5 cursor-pointer hover:border-emerald-500/20 transition-colors group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="text-emerald-400" size={18} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-0.5">
                        {analytics?.total_solved || 0}
                    </h3>
                    <p className="text-emerald-400/70 text-xs font-semibold uppercase tracking-wide">Solved</p>
                </div>

                {/* Streak */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <TrendingUp className="text-amber-400" size={18} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-0.5">
                        {analytics?.revision_streak ?? 0}<span className="text-sm text-slate-600 font-normal ml-1.5">days</span>
                    </h3>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Current Streak</p>
                </div>

                {/* Reminders */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
                            <Clock className="text-rose-400" size={18} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-0.5">
                        {reminders?.length || 0}
                    </h3>
                    <p className="text-rose-400/70 text-xs font-semibold uppercase tracking-wide">Active Reminders</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Weekly Activity Chart */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-white mb-0.5 flex items-center gap-2">
                                <BarChart3 size={16} className="text-violet-400" />
                                Weekly Activity
                            </h3>
                            <p className="text-xs text-slate-500">Daily problems solved and revised</p>
                        </div>
                        <div className="p-1.5 bg-white/5 rounded-md">
                            <Calendar size={14} className="text-slate-400" />
                        </div>
                    </div>

                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="transparent"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={8}
                                />
                                <YAxis
                                    stroke="transparent"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        backgroundColor: '#1a1a1c',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar
                                    dataKey="solved"
                                    name="Solved"
                                    radius={[4, 4, 0, 0]}
                                    fill="#8b5cf6"
                                    barSize={14}
                                />
                                <Bar
                                    dataKey="revised"
                                    name="Revised"
                                    radius={[4, 4, 0, 0]}
                                    fill="#34d399"
                                    barSize={14}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <div className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
                            Solved
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                            Revised
                        </div>
                    </div>
                </div>

                {/* Upcoming Reminders */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-white mb-0.5">Upcoming Reminders</h3>
                            <p className="text-xs text-slate-500">Don't break your streak</p>
                        </div>
                        <div className="p-1.5 bg-white/5 rounded-md">
                            <Clock size={14} className="text-slate-400" />
                        </div>
                    </div>

                    {upcomingReminders.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingReminders.map((reminder, index) => (
                                <div
                                    key={reminder.id}
                                    onClick={() => navigate(`/problems/${reminder.id}`)}
                                    className="group flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-violet-500/20 rounded-lg cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-violet-500/10 flex items-center justify-center">
                                            <Calendar size={14} className="text-violet-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm text-white">{reminder.title}</h4>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                By {new Date(reminder.next_reminder_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[220px] flex flex-col items-center justify-center text-slate-600">
                            <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                                <CheckCircle size={24} />
                            </div>
                            <p className="text-sm font-medium">You're all caught up!</p>
                            <p className="text-xs mt-1 text-slate-700">No pending revisions for the next 24 hours.</p>
                        </div>
                    )}

                    {upcomingReminders.length > 0 && (
                        <button
                            onClick={() => navigate('/problems')}
                            className="w-full mt-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition-all border border-white/[0.04]"
                        >
                            View All Reminders
                        </button>
                    )}
                </div>
            </div>

            {/* Floating Action Buttons */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                onClick={() => navigate('/problems/new')}
                className="fixed bottom-8 right-8 w-14 h-14 bg-violet-600 rounded-full shadow-lg shadow-violet-600/25 flex items-center justify-center hover:bg-violet-500 hover:scale-105 transition-all duration-200 z-50 group"
            >
                <Plus size={24} className="text-white" />
                <span className="absolute right-20 bg-[#1a1a1c] text-white text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/[0.06] pointer-events-none">
                    Add New Problem
                </span>
            </motion.button>

            {/* Feedback FAB */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                onClick={() => setShowFeedback(true)}
                className="fixed bottom-8 left-8 w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full shadow-lg shadow-rose-600/25 flex items-center justify-center hover:scale-105 transition-all duration-200 z-50 group"
            >
                <MessageCircle size={22} className="text-white" />
                <span className="absolute left-20 bg-[#1a1a1c] text-white text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/[0.06] pointer-events-none">
                    Leave Feedback
                </span>
            </motion.button>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowFeedback(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-2xl"
                        >
                            <button
                                onClick={() => setShowFeedback(false)}
                                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-1">Share Your Feedback</h3>
                            <p className="text-sm text-slate-400 mb-6">Help us improve! Your review appears on our landing page.</p>

                            {/* Star Rating */}
                            <div className="mb-5">
                                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setFeedbackRating(star)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={28}
                                                className={`transition-colors ${
                                                    star <= feedbackRating
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-slate-600'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Role */}
                            <div className="mb-5">
                                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Your Role</label>
                                <input
                                    type="text"
                                    value={feedbackRole}
                                    onChange={(e) => setFeedbackRole(e.target.value)}
                                    placeholder="e.g. Software Engineer, Student"
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                                />
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Message</label>
                                <textarea
                                    value={feedbackMessage}
                                    onChange={(e) => setFeedbackMessage(e.target.value)}
                                    placeholder="What do you think about FAANG Forge? How has it helped you?"
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                                />
                                <p className="text-right text-xs text-slate-600 mt-1">{feedbackMessage.length}/500</p>
                            </div>

                            {/* Submit */}
                            <button
                                disabled={!feedbackMessage.trim() || submittingFeedback}
                                onClick={async () => {
                                    setSubmittingFeedback(true);
                                    try {
                                        await feedbackAPI.submit({
                                            rating: feedbackRating,
                                            message: feedbackMessage.trim(),
                                            role: feedbackRole.trim() || 'Developer'
                                        });
                                        toast.success('Thank you for your feedback! 🎉');
                                        setShowFeedback(false);
                                        setFeedbackMessage('');
                                        setFeedbackRating(5);
                                        setFeedbackRole('');
                                    } catch (err) {
                                        toast.error('Failed to submit feedback. Try again.');
                                    } finally {
                                        setSubmittingFeedback(false);
                                    }
                                }}
                                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-colors"
                            >
                                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardPage;
