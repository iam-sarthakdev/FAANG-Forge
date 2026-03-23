import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Copy, Check, Flame, Target, BookOpen, Code2, ExternalLink } from 'lucide-react';
import { fetchAnalytics } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileCardPage = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('dark');
    const cardRef = useRef(null);

    useEffect(() => {
        fetchAnalytics()
            .then(data => setAnalytics(data))
            .catch(err => console.error('Failed to fetch analytics:', err))
            .finally(() => setLoading(false));
    }, []);

    const themes = {
        dark: {
            bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
            border: 'border-white/10',
            text: 'text-white',
            subtext: 'text-white/60',
            accent: 'from-purple-500 to-pink-500'
        },
        ocean: {
            bg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
            border: 'border-blue-400/20',
            text: 'text-white',
            subtext: 'text-blue-200/60',
            accent: 'from-cyan-400 to-blue-500'
        },
        forest: {
            bg: 'bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900',
            border: 'border-emerald-400/20',
            text: 'text-white',
            subtext: 'text-emerald-200/60',
            accent: 'from-emerald-400 to-teal-500'
        }
    };

    const theme = themes[selectedTheme];

    const handleCopyImage = async () => {
        if (!cardRef.current) return;

        try {
            // Use html2canvas-like approach via canvas
            const card = cardRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Simplified: copy as text stats
            const statsText = [
                `🚀 ${user?.name || 'Developer'}'s FAANG Forge Stats`,
                `━━━━━━━━━━━━━━━━━━`,
                `🔥 Streak: ${analytics?.revision_streak || 0} days`,
                `💡 Problems: ${analytics?.total_problems || 0} tracked`,
                `✅ Solved: ${analytics?.total_solved || 0}`,
                `📚 Revisions: ${analytics?.total_revisions || 0}`,
                `━━━━━━━━━━━━━━━━━━`,
                `📊 Difficulty: Easy ${analytics?.by_difficulty?.Easy || 0} | Medium ${analytics?.by_difficulty?.Medium || 0} | Hard ${analytics?.by_difficulty?.Hard || 0}`,
                ``,
                `Powered by FAANG Forge — https://algo-flow-khaki.vercel.app`
            ].join('\n');

            await navigator.clipboard.writeText(statsText);
            setCopied(true);
            toast.success('Stats copied to clipboard!');
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            toast.error('Failed to copy. Try again.');
        }
    };

    const handleShareLink = () => {
        const shareUrl = `https://algo-flow-khaki.vercel.app`;
        const shareText = `🚀 I'm preparing for FAANG interviews with FAANG Forge! ${analytics?.total_solved || 0} problems solved, ${analytics?.revision_streak || 0} day streak. Check it out:`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My FAANG Forge Stats',
                text: shareText,
                url: shareUrl
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            toast.success('Share text copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-3 mb-4">
                    <Share2 className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-bold text-gradient">Share Your Progress</h1>
                </div>
                <p className="text-white/50">Generate a beautiful stats card to share on LinkedIn, GitHub, or social media</p>
            </motion.div>

            {/* Theme Selector */}
            <div className="flex gap-3 justify-center mb-8">
                {Object.keys(themes).map(t => (
                    <button
                        key={t}
                        onClick={() => setSelectedTheme(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                            selectedTheme === t
                                ? 'bg-primary text-white'
                                : 'glass-card text-white/60 hover:text-white/80'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Stats Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center mb-8"
            >
                <div
                    ref={cardRef}
                    className={`w-full max-w-lg ${theme.bg} rounded-2xl border ${theme.border} p-8 shadow-2xl`}
                    style={{ aspectRatio: '16/10' }}
                >
                    {/* Card Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center text-2xl font-bold shadow-lg`}>
                            {user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${theme.text}`}>
                                {user?.name || 'Developer'}
                            </h2>
                            <p className={`text-sm ${theme.subtext}`}>
                                FAANG Interview Preparation
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${theme.text} flex items-center justify-center gap-1`}>
                                <Flame className="w-5 h-5 text-orange-400" />
                                {analytics?.revision_streak || 0}
                            </div>
                            <div className={`text-xs ${theme.subtext} mt-1`}>Day Streak</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${theme.text} flex items-center justify-center gap-1`}>
                                <Target className="w-5 h-5 text-blue-400" />
                                {analytics?.total_problems || 0}
                            </div>
                            <div className={`text-xs ${theme.subtext} mt-1`}>Problems</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${theme.text} flex items-center justify-center gap-1`}>
                                <Code2 className="w-5 h-5 text-green-400" />
                                {analytics?.total_solved || 0}
                            </div>
                            <div className={`text-xs ${theme.subtext} mt-1`}>Solved</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${theme.text} flex items-center justify-center gap-1`}>
                                <BookOpen className="w-5 h-5 text-purple-400" />
                                {analytics?.total_revisions || 0}
                            </div>
                            <div className={`text-xs ${theme.subtext} mt-1`}>Revisions</div>
                        </div>
                    </div>

                    {/* Difficulty Breakdown */}
                    <div className="mb-6">
                        <div className="flex gap-2 items-center">
                            <div className="flex-1 h-3 rounded-full bg-black/30 overflow-hidden flex">
                                {analytics?.total_problems > 0 && (
                                    <>
                                        <div
                                            className="h-full bg-green-500 rounded-l-full"
                                            style={{ width: `${((analytics?.by_difficulty?.Easy || 0) / (analytics.total_solved || analytics.total_problems || 1)) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-yellow-500"
                                            style={{ width: `${((analytics?.by_difficulty?.Medium || 0) / (analytics.total_solved || analytics.total_problems || 1)) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-red-500 rounded-r-full"
                                            style={{ width: `${((analytics?.by_difficulty?.Hard || 0) / (analytics.total_solved || analytics.total_problems || 1)) * 100}%` }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className={`text-xs ${theme.subtext}`}>
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                                Easy {analytics?.by_difficulty?.Easy || 0}
                            </span>
                            <span className={`text-xs ${theme.subtext}`}>
                                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                                Medium {analytics?.by_difficulty?.Medium || 0}
                            </span>
                            <span className={`text-xs ${theme.subtext}`}>
                                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                                Hard {analytics?.by_difficulty?.Hard || 0}
                            </span>
                        </div>
                    </div>

                    {/* Watermark */}
                    <div className={`flex items-center justify-between pt-4 border-t ${theme.border}`}>
                        <div className={`text-xs ${theme.subtext} flex items-center gap-1`}>
                            Powered by <span className="font-semibold text-gradient">FAANG Forge</span>
                        </div>
                        <div className={`text-xs ${theme.subtext}`}>
                            algo-flow-khaki.vercel.app
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyImage}
                    className="btn-primary flex items-center gap-2 px-6 py-3"
                >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied!' : 'Copy Stats'}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareLink}
                    className="btn-secondary flex items-center gap-2 px-6 py-3"
                >
                    <ExternalLink className="w-5 h-5" />
                    Share
                </motion.button>
            </div>

            {/* Usage Tips */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 mt-10"
            >
                <h3 className="font-semibold text-lg mb-3">💡 How to use your stats card</h3>
                <ul className="space-y-2 text-white/60 text-sm">
                    <li>• <strong>LinkedIn:</strong> Share your progress in a post to show dedication to tech interviews</li>
                    <li>• <strong>GitHub README:</strong> Paste the stats text in your profile README to showcase your prep</li>
                    <li>• <strong>Resume:</strong> Reference your streak and problem count as evidence of consistent practice</li>
                    <li>• <strong>Twitter/X:</strong> Share your milestones to connect with other developers</li>
                </ul>
            </motion.div>
        </div>
    );
};

export default ProfileCardPage;
