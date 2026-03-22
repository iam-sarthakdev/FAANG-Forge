import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, TrendingUp, Clock, Shield, Zap, Users, Trophy, Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
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
        <div className="min-h-screen overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center px-6 py-20">
                {/* Animated background */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="max-w-6xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <motion.h1
                            className="text-6xl md:text-8xl font-bold mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <span className="text-gradient">Master DSA</span>
                            <br />
                            <span className="text-white">The Smart Way</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Leverage scientifically-proven spaced repetition to ace your coding interviews.
                            Track progress, build streaks, and master algorithms efficiently.
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
                                className="btn-primary text-lg px-8 py-4"
                            >
                                Get Started Free
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="btn-secondary text-lg px-8 py-4"
                            >
                                Sign In
                            </motion.button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="mt-16 text-white/40 text-sm"
                        >
                            <p>✨ No credit card required • 🔒 100% Free Forever</p>
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
            <section className="py-20 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-bold text-gradient mb-4">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            Built for serious developers preparing for top tech companies
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
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="glass-card p-6 cursor-pointer group"
                            >
                                <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-white/60">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Platform Stats Section */}
            <section className="py-20 px-6">
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
                        className="text-center mb-10"
                    >
                        <h2 className="text-4xl font-bold text-gradient mb-3">
                            Platform Activity
                        </h2>
                        <p className="text-white/50 text-sm flex items-center justify-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live stats from real users
                        </p>
                    </motion.div>

                    <div className="glass-card p-12">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, type: "spring" }}
                            >
                                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                                    <AnimatedCounter end={platformStats?.totalUsers || 0} />
                                </div>
                                <div className="text-white/60 flex items-center justify-center gap-1.5">
                                    <Users className="w-4 h-4" /> Registered Users
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, type: "spring" }}
                            >
                                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                                    <AnimatedCounter end={platformStats?.totalProblemsTracked || 0} />
                                </div>
                                <div className="text-white/60">Problems Tracked</div>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                                    <AnimatedCounter end={platformStats?.totalRevisions || 0} />
                                </div>
                                <div className="text-white/60">Revisions Done</div>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, type: "spring" }}
                            >
                                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                                    <AnimatedCounter end={platformStats?.activeUsersWeek || 0} />
                                </div>
                                <div className="text-white/60">Active This Week</div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Leaderboard Preview Section */}
            {leaderboard && leaderboard.topStreaks && leaderboard.topStreaks.length > 0 && (
                <section className="py-16 px-6">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-10"
                        >
                            <h2 className="text-4xl font-bold mb-3">
                                <Trophy className="inline w-8 h-8 text-yellow-400 mr-2 mb-1" />
                                <span className="text-gradient">Top Performers</span>
                            </h2>
                            <p className="text-white/50">See who's crushing their interview prep</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="glass-card overflow-hidden"
                        >
                            <div className="grid grid-cols-3 gap-px bg-white/5">
                                {/* Top Streaks */}
                                <div className="p-6">
                                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">🔥 Top Streaks</h3>
                                    <div className="space-y-3">
                                        {leaderboard.topStreaks.slice(0, 5).map((user, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/40'}`}>
                                                    #{i + 1}
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                                    {user.name?.[0] || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{user.name}</div>
                                                    <div className="text-xs text-white/40">{user.streak} day streak</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Solvers */}
                                <div className="p-6 border-x border-white/5">
                                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">💡 Most Problems</h3>
                                    <div className="space-y-3">
                                        {(leaderboard.topSolvers || []).slice(0, 5).map((user, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/40'}`}>
                                                    #{i + 1}
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                                                    {user.name?.[0] || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{user.name}</div>
                                                    <div className="text-xs text-white/40">{user.problemsSolved} solved</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Revisers */}
                                <div className="p-6">
                                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">📚 Most Revisions</h3>
                                    <div className="space-y-3">
                                        {(leaderboard.topRevisers || []).slice(0, 5).map((user, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-white/40'}`}>
                                                    #{i + 1}
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold">
                                                    {user.name?.[0] || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{user.name}</div>
                                                    <div className="text-xs text-white/40">{user.totalRevisions} revisions</div>
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
                            className="text-center mt-6"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="text-primary hover:text-primary/80 text-sm font-medium"
                            >
                                Join to see full leaderboard →
                            </motion.button>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Testimonials Section */}
            {testimonials.length > 0 && (
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-bold text-gradient mb-3">
                                What Users Say
                            </h2>
                            <p className="text-white/50">Real feedback from real developers</p>
                        </motion.div>

                        <div className="relative">
                            <div className="glass-card p-10 min-h-[200px] flex flex-col items-center justify-center text-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentTestimonial}
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        transition={{ duration: 0.4 }}
                                        className="max-w-2xl"
                                    >
                                        <Quote className="w-8 h-8 text-primary/40 mx-auto mb-4" />
                                        <p className="text-lg text-white/80 mb-6 italic leading-relaxed">
                                            "{testimonials[currentTestimonial]?.message}"
                                        </p>
                                        <div className="flex flex-col items-center gap-2">
                                            <StarRating rating={testimonials[currentTestimonial]?.rating || 5} />
                                            <div className="text-white/90 font-semibold">
                                                {testimonials[currentTestimonial]?.name}
                                            </div>
                                            <div className="text-white/40 text-sm">
                                                {testimonials[currentTestimonial]?.role || 'Developer'}
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {testimonials.length > 1 && (
                                <div className="flex justify-center gap-4 mt-6">
                                    <button
                                        onClick={() => setCurrentTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                                        className="p-2 glass-card rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-white/60" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {testimonials.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentTestimonial(i)}
                                                className={`w-2 h-2 rounded-full transition-all ${i === currentTestimonial ? 'bg-primary w-6' : 'bg-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentTestimonial(prev => (prev + 1) % testimonials.length)}
                                        className="p-2 glass-card rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-white/60" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h2 className="text-5xl font-bold mb-6">
                        Ready to Ace Your Interviews?
                    </h2>
                    <p className="text-xl text-white/60 mb-10">
                        Join developers who are building real interview skills with data-driven preparation
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/register')}
                        className="btn-primary text-lg px-12 py-4"
                    >
                        Start Learning for Free
                    </motion.button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center text-white/40">
                    <p>© 2026 FAANG Forge. Built for developers, by developers.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
