import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Target, BookOpen, Medal, Crown, Award } from 'lucide-react';
import { platformAPI } from '../services/api';

const tabs = [
    { id: 'streaks', label: 'Top Streaks', icon: <Flame className="w-4 h-4" />, color: 'from-orange-500 to-red-500' },
    { id: 'solvers', label: 'Most Solved', icon: <Target className="w-4 h-4" />, color: 'from-cyan-500 to-blue-500' },
    { id: 'revisers', label: 'Most Revisions', icon: <BookOpen className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' }
];

const rankIcons = [
    <Crown className="w-5 h-5 text-yellow-400" />,
    <Medal className="w-5 h-5 text-gray-300" />,
    <Award className="w-5 h-5 text-amber-600" />
];

const LeaderboardPage = () => {
    const [activeTab, setActiveTab] = useState('streaks');
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchLeaderboard = async () => {
        try {
            const res = await platformAPI.getLeaderboard();
            setLeaderboard(res.data);
            setLastUpdated(res.data.lastUpdated);
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    const getActiveData = () => {
        if (!leaderboard) return [];
        switch (activeTab) {
            case 'streaks': return leaderboard.topStreaks || [];
            case 'solvers': return leaderboard.topSolvers || [];
            case 'revisers': return leaderboard.topRevisers || [];
            default: return [];
        }
    };

    const getStatValue = (user) => {
        switch (activeTab) {
            case 'streaks': return `${user.streak} day streak`;
            case 'solvers': return `${user.problemsSolved} problems`;
            case 'revisers': return `${user.totalRevisions} revisions`;
            default: return '';
        }
    };

    const getAvatarGradient = () => {
        const tab = tabs.find(t => t.id === activeTab);
        return tab ? tab.color : 'from-purple-500 to-pink-500';
    };

    const data = getActiveData();

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-3 mb-4">
                    <Trophy className="w-10 h-10 text-yellow-400" />
                    <h1 className="text-4xl font-bold text-gradient">Leaderboard</h1>
                </div>
                <p className="text-white/50">Top performers driving their interview preparation</p>
                {lastUpdated && (
                    <p className="text-white/30 text-xs mt-2">
                        Updated {new Date(lastUpdated).toLocaleTimeString()} • Auto-refreshes every 60s
                    </p>
                )}
            </motion.div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-8 justify-center">
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'glass-card text-white/60 hover:text-white/80'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Leaderboard List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : data.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-16 text-center"
                >
                    <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white/50 mb-2">No data yet</h3>
                    <p className="text-white/30">Start solving problems and building your streak to appear here!</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                        >
                            {data.map((user, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.06 }}
                                    className={`glass-card p-4 flex items-center gap-4 group hover:bg-white/5 transition-all ${
                                        index < 3 ? 'border border-white/10' : ''
                                    }`}
                                >
                                    {/* Rank */}
                                    <div className="w-10 flex justify-center">
                                        {index < 3 ? (
                                            <motion.div
                                                initial={{ rotate: -20, scale: 0 }}
                                                animate={{ rotate: 0, scale: 1 }}
                                                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                                            >
                                                {rankIcons[index]}
                                            </motion.div>
                                        ) : (
                                            <span className="text-white/40 font-bold text-lg">
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center text-lg font-bold shadow-lg ${
                                        index === 0 ? 'ring-2 ring-yellow-400/50' : ''
                                    }`}>
                                        {user.name?.[0]?.toUpperCase() || '?'}
                                    </div>

                                    {/* Name & Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-semibold text-lg ${index === 0 ? 'text-yellow-200' : 'text-white'}`}>
                                            {user.name || 'Anonymous'}
                                        </div>
                                        <div className="text-white/40 text-sm">
                                            {activeTab === 'streaks' && user.problemsSolved > 0 && `${user.problemsSolved} problems solved`}
                                            {activeTab === 'solvers' && user.streak > 0 && `${user.streak} day streak`}
                                            {activeTab === 'revisers' && user.streak > 0 && `${user.streak} day streak`}
                                        </div>
                                    </div>

                                    {/* Stat Value */}
                                    <div className="text-right">
                                        <div className={`text-xl font-bold ${
                                            index === 0 ? 'text-gradient' :
                                            index === 1 ? 'text-gray-200' :
                                            index === 2 ? 'text-amber-400' :
                                            'text-white/70'
                                        }`}>
                                            {activeTab === 'streaks' && `${user.streak}`}
                                            {activeTab === 'solvers' && `${user.problemsSolved}`}
                                            {activeTab === 'revisers' && `${user.totalRevisions}`}
                                        </div>
                                        <div className="text-white/30 text-xs">
                                            {getStatValue(user).split(' ').slice(1).join(' ')}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default LeaderboardPage;
