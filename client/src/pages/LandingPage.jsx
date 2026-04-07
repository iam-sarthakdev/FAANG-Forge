import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, TrendingUp, Clock, Shield, Zap, Users, Trophy, Star, ChevronLeft, ChevronRight, Quote, Sparkles } from 'lucide-react';
import { platformAPI, feedbackAPI } from '../services/api';

// Animated count-up component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [lastAnimatedEnd, setLastAnimatedEnd] = useState(null);

    useEffect(() => {
        // Only run animation when we have real data (end > 0) or if it's genuinely 0
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Animate if it's visible AND we haven't animated to this specific 'end' value yet
                if (entry.isIntersecting && end !== lastAnimatedEnd) {
                    setLastAnimatedEnd(end);
                    
                    const startTime = Date.now();
                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * end));
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration, lastAnimatedEnd]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}{suffix}
        </span>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [platformStats, setPlatformStats] = useState(null);
    const [testimonials, setTestimonials] = useState([]);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [leaderboard, setLeaderboard] = useState(null);

    useEffect(() => {
        // Fetch real platform stats
        platformAPI.getStats()
            .then(res => setPlatformStats(res.data))
            .catch(() => {});

        // Fetch approved testimonials
        feedbackAPI.getApproved()
            .then(res => setTestimonials(res.data || []))
            .catch(() => {});

        // Fetch leaderboard preview
        platformAPI.getLeaderboard()
            .then(res => setLeaderboard(res.data))
            .catch(() => {});
    }, []);

    // Testimonial auto-rotate
    useEffect(() => {
        if (testimonials.length > 1) {
            const interval = setInterval(() => {
                setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [testimonials.length]);

    const features = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: 'Smart Spaced Repetition',
            description: 'Scientifically-proven algorithm ensures you revise problems at optimal intervals for maximum retention'
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: 'Topic Mastery Tracking',
            description: 'Visualize your progress across different DSA topics and identify weak areas instantly'
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Advanced Analytics',
            description: 'Comprehensive insights with charts, heatmaps, and streak tracking to keep you motivated'
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: 'Automated Reminders',
            description: 'Never forget a revision with smart notifications and personalized scheduling'
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: 'Company Problems',
            description: '2892+ problems from 20+ FAANG & top-tier companies with difficulty filtering'
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Lightning Fast',
            description: 'Optimized performance with instant search, filtering, and real-time updates'
        }
    ];

    // Star rating component
    const StarRating = ({ rating }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-black overflow-hidden font-sans selection:bg-fuchsia-500/30 text-white relative">
            {/* Optimized background without lagging animations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-violet-600/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-fuchsia-600/5 rounded-full blur-[150px]" />
                {/* Subtle top glare */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute -top-4 inset-x-0 h-10 w-full bg-white/10 blur-xl opacity-50" />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center px-6 py-20 z-10">
                <div className="max-w-6xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] mb-8"
                        >
                            <Sparkles size={12} className="text-amber-400" />
                            <span className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">The Ultimate Prep Toolkit</span>
                        </motion.div>

                        <motion.h1
                            className="text-6xl md:text-7xl lg:text-[88px] leading-[1.1] font-extrabold mb-8 tracking-tighter"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Master DSA</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">The Smart Way</span>
                        </motion.h1>

                        <motion.p
                            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Leverage scientifically-proven spaced repetition to ace your coding interviews.
                            Track progress, build streaks, and conquer algorithms efficiently.
                        </motion.p>

                        <motion.div
                            className="flex gap-4 justify-center flex-wrap"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="relative group px-8 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full font-bold text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] transition-all hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.7)]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started Free
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="px-8 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full font-medium text-white transition-all backdrop-blur-sm"
                            >
                                Sign In
                            </motion.button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="mt-16 text-slate-500 text-[13px] font-medium tracking-wide flex items-center justify-center gap-4"
                        >
                            <span className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-500" /> No credit card required</span>
                            <span>•</span>
                            <span>🔒 100% Free Forever</span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-6 h-10 border-2 border-white/30 rounded-full p-2"
                    >
                        <motion.div className="w-1 h-3 bg-white/50 rounded-full mx-auto" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-6 tracking-tight">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-[17px] text-slate-400 max-w-2xl mx-auto">
                            Built for ambitious developers aiming for top tech companies.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="group relative bg-[#09090b] border border-white/[0.04] hover:border-white/[0.12] rounded-[24px] p-8 overflow-hidden transition-all duration-300"
                            >
                                {/* Subtle internal gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-violet-400 group-hover:scale-110 group-hover:text-fuchsia-400 shadow-Inner transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-slate-100 tracking-tight group-hover:text-white transition-colors">{feature.title}</h3>
                                    <p className="text-slate-500 text-[15px] leading-relaxed line-clamp-3">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Platform Stats Section */}
            <section className="py-24 px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-3 tracking-tight">
                            Platform Activity
                        </h2>
                        <p className="text-slate-400 text-[15px] flex items-center justify-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live metrics from our prep community
                        </p>
                    </motion.div>

                    <div className="bg-[#09090b] border border-white/[0.04] p-12 rounded-[32px] relative overflow-hidden shadow-2xl shadow-violet-500/5">
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tighter">
                                    <AnimatedCounter end={platformStats?.totalUsers || 0} />
                                </div>
                                <div className="text-slate-500 text-[13px] font-medium uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    <Users size={14} className="text-violet-400" /> Users
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tighter">
                                    <AnimatedCounter end={platformStats?.totalProblemsTracked || 0} />
                                </div>
                                <div className="text-slate-500 text-[13px] font-medium uppercase tracking-widest">
                                    Problems
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tighter">
                                    <AnimatedCounter end={platformStats?.totalRevisions || 0} />
                                </div>
                                <div className="text-slate-500 text-[13px] font-medium uppercase tracking-widest">
                                    Revisions
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tighter">
                                    <AnimatedCounter end={platformStats?.activeUsersWeek || 0} />
                                </div>
                                <div className="text-slate-500 text-[13px] font-medium uppercase tracking-widest">
                                    Active / Wk
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Leaderboard Preview Section */}
            {leaderboard && leaderboard.topStreaks && leaderboard.topStreaks.length > 0 && (
                <section className="py-24 px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight flex items-center justify-center gap-3">
                                <Trophy className="w-10 h-10 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                Top Performers
                            </h2>
                            <p className="text-[17px] text-slate-400">See who is dominating the interview prep leaderboards</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#09090b] border border-white/[0.04] rounded-3xl overflow-hidden shadow-2xl relative"
                        >
                            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
                                {/* Top Streaks */}
                                <div className="p-8">
                                    <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Zap size={14} /> Top Streaks
                                    </h3>
                                    <div className="space-y-4">
                                        {leaderboard.topStreaks.slice(0, 5).map((user, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <span className={`text-[13px] font-bold w-4 ${i === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                                                    {i + 1}
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {user.name?.[0] || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[14px] font-medium text-slate-200 truncate group-hover:text-white transition-colors">{user.name}</div>
                                                    <div className="text-[12px] text-slate-500">{user.streak} day streak</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Solvers */}
                                <div className="p-8 border-t md:border-t-0 border-white/[0.04]">
                                    <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Target size={14} /> Most Problems
                                    </h3>
                                    <div className="space-y-4">
                                        {(leaderboard.topSolvers || []).slice(0, 5).map((user, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <span className={`text-[13px] font-bold w-4 ${i === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                                                    {i + 1}
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {user.name?.[0] || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[14px] font-medium text-slate-200 truncate group-hover:text-white transition-colors">{user.name}</div>
                                                    <div className="text-[12px] text-slate-500">{user.problemsSolved} solved</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Revisers */}
                                <div className="p-8 border-t md:border-t-0 border-white/[0.04]">
                                    <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <TrendingUp size={14} /> Most Revisions
                                    </h3>
                                    <div className="space-y-4">
                                        {(leaderboard.topRevisers || []).slice(0, 5).map((user, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <span className={`text-[13px] font-bold w-4 ${i === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                                                    {i + 1}
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-xs font-bold text-slate-300">
                                                    {user.name?.[0] || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[14px] font-medium text-slate-200 truncate group-hover:text-white transition-colors">{user.name}</div>
                                                    <div className="text-[12px] text-slate-500">{user.totalRevisions} revisions</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mt-10"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/register')}
                                className="text-violet-400 hover:text-violet-300 border-b border-violet-500/30 pb-0.5 text-[15px] font-medium transition-colors"
                            >
                                Join to see full leaderboard &rarr;
                            </motion.button>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Testimonials Section */}
            {testimonials.length > 0 && (
                <section className="py-24 px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-4 tracking-tight">
                                Wall of Love
                            </h2>
                            <p className="text-[17px] text-slate-400">Feedback from real engineers who landed their dream jobs</p>
                        </motion.div>

                        <div className="relative">
                            <div className="bg-[#09090b] border border-white/[0.04] rounded-3xl p-12 min-h-[250px] flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentTestimonial}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="max-w-3xl"
                                    >
                                        <Quote className="w-10 h-10 text-violet-500/20 mx-auto mb-6" />
                                        <p className="text-xl md:text-2xl text-slate-200 mb-8 font-medium leading-relaxed">
                                            "{testimonials[currentTestimonial]?.message}"
                                        </p>
                                        <div className="flex flex-col items-center gap-3">
                                            <StarRating rating={testimonials[currentTestimonial]?.rating || 5} />
                                            <div>
                                                <div className="text-white font-bold text-[15px]">
                                                    {testimonials[currentTestimonial]?.name}
                                                </div>
                                                <div className="text-slate-500 text-[13px] tracking-wide mt-0.5">
                                                    {testimonials[currentTestimonial]?.role || 'Software Engineer'}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {testimonials.length > 1 && (
                                <div className="flex justify-center items-center gap-6 mt-8">
                                    <button
                                        onClick={() => setCurrentTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                                        className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        {testimonials.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentTestimonial(i)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'bg-violet-500 w-8' : 'bg-white/10 hover:bg-white/20 w-1.5'}`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentTestimonial(prev => (prev + 1) % testimonials.length)}
                                        className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-32 px-6 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-violet-600/[0.02] border-y border-white/[0.02]" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center relative z-10"
                >
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
                        Ready to Ace the Core?
                    </h2>
                    <p className="text-[17px] text-slate-400 mb-10 max-w-2xl mx-auto">
                        Stop grinding blindly. Join ambitious developers who are building structured interview skills with data-driven workflows today.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/register')}
                        className="relative group px-10 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full font-bold text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] transition-all hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.7)] text-lg"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Start Working for Free
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/[0.04] bg-[#09090b] relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-slate-500 text-[13px]">
                    <p>© {new Date().getFullYear()} FAANG Forge. Built for engineers, by engineers.</p>
                    <div className="flex gap-6 mt-4 md:mt-0 font-medium">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="https://github.com/iam-sarthakdev/AlgoFlow" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                        <a href="mailto:sharma111sarthak@gmail.com" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
