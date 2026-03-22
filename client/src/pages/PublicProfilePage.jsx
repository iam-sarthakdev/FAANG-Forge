import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { platformAPI } from '../services/api';
import CalendarHeatmap from 'react-calendar-heatmap';
import { format, subDays } from 'date-fns';
import { Trophy, Zap, BookOpen, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-calendar-heatmap/dist/styles.css'; // Will also add custom overrides in index.css

const PublicProfilePage = () => {
    const { username } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const res = await platformAPI.getPublicProfile(username);
                if (res.success) {
                    setProfileData(res.data);
                } else {
                    toast.error('Profile not found');
                }
            } catch (error) {
                console.error(error);
                toast.error('Could not load profile');
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            loadProfile();
        }
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen py-20 px-6 max-w-7xl mx-auto flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen py-20 px-6 max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">User not found</h2>
                <Link to="/" className="text-primary hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </div>
        );
    }

    const { user, activityDates } = profileData;
    const stats = user.stats || { totalProblems: 0, currentStreak: 0, totalRevisions: 0 };
    
    const today = new Date();
    const oneYearAgo = subDays(today, 365);

    // Group activity by local day
    const activityMap = {};
    if (activityDates) {
        activityDates.forEach(dateStr => {
            const d = new Date(dateStr);
            const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            activityMap[localDateStr] = (activityMap[localDateStr] || 0) + 1;
        });
    }

    const activity = Object.keys(activityMap).map(date => ({
        date,
        count: activityMap[date]
    }));

    // Initial letters for avatar fallback
    const initials = user.name?.substring(0, 2).toUpperCase() || 'U';

    return (
        <div className="min-h-screen py-10 px-6 max-w-5xl mx-auto">
            <Link to="/leaderboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden"
            >
                {/* Background decorative blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-1 flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-dark rounded-xl flex items-center justify-center overflow-hidden relative">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-white tracking-wider">{initials}</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                </div>
                
                <div className="flex-1 text-center md:text-left relative z-10">
                    <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                    <p className="text-primary/80 font-mono mb-4">@{user.username}</p>
                    <p className="text-white/50 text-sm flex items-center justify-center md:justify-start gap-2">
                        <Calendar className="w-4 h-4" /> 
                        Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
                    </p>
                </div>
            </motion.div>

            {/* Stats Grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 border-l-4 border-l-blue-500"
                >
                    <div className="flex items-center gap-3 text-white/60 mb-2">
                        <Trophy className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold">Problems Solved</h3>
                    </div>
                    <div className="text-3xl font-bold">{stats.totalProblems || 0}</div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 border-l-4 border-l-orange-500"
                >
                    <div className="flex items-center gap-3 text-white/60 mb-2">
                        <Zap className="w-5 h-5 text-orange-400" />
                        <h3 className="font-semibold">Current Streak</h3>
                    </div>
                    <div className="text-3xl font-bold flex items-baseline gap-2">
                        {stats.currentStreak || 0} <span className="text-sm text-white/40 font-normal">days</span>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 border-l-4 border-l-green-500"
                >
                    <div className="flex items-center gap-3 text-white/60 mb-2">
                        <BookOpen className="w-5 h-5 text-green-400" />
                        <h3 className="font-semibold">Total Revisions</h3>
                    </div>
                    <div className="text-3xl font-bold">{stats.totalRevisions || 0}</div>
                </motion.div>
            </div>

            {/* GitHub Style Heatmap */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-8"
            >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Activity History
                </h3>
                
                <div className="heatmap-container overflow-x-auto pb-4">
                    <div className="min-w-[700px]">
                        <CalendarHeatmap
                            startDate={oneYearAgo}
                            endDate={today}
                            values={activity || []}
                            classForValue={(value) => {
                                if (!value || value.count === 0) {
                                    return 'color-empty';
                                }
                                if (value.count === 1) return 'color-scale-1';
                                if (value.count <= 3) return 'color-scale-2';
                                if (value.count <= 6) return 'color-scale-3';
                                return 'color-scale-4';
                            }}
                            tooltipDataAttrs={value => {
                                if (!value || !value.date) return null;
                                return {
                                    'data-tooltip-id': 'heatmap-tooltip',
                                    'data-tooltip-content': `${value.count} contributions on ${format(new Date(value.date), 'MMM do, yyyy')}`
                                };
                            }}
                            showWeekdayLabels={true}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PublicProfilePage;
