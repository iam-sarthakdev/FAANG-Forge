import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, Clock, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: 'Smart Spaced Repetition',
            description: 'AI-powered algorithm ensures you revise problems at optimal intervals for maximum retention'
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
            title: 'Secure & Private',
            description: 'Your data is encrypted and protected with enterprise-grade security'
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Lightning Fast',
            description: 'Optimized performance with instant search, filtering, and real-time updates'
        }
    ];

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

            {/* Stats Section */}
            <section className="py-20 px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto glass-card p-12"
                >
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <motion.div
                                className="text-5xl font-bold text-gradient mb-2"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, type: "spring" }}
                            >
                                10,000+
                            </motion.div>
                            <div className="text-white/60">Problems Tracked</div>
                        </div>
                        <div>
                            <motion.div
                                className="text-5xl font-bold text-gradient mb-2"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, type: "spring" }}
                            >
                                5,000+
                            </motion.div>
                            <div className="text-white/60">Active Users</div>
                        </div>
                        <div>
                            <motion.div
                                className="text-5xl font-bold text-gradient mb-2"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6, type: "spring" }}
                            >
                                95%
                            </motion.div>
                            <div className="text-white/60">Success Rate</div>
                        </div>
                    </div>
                </motion.div>
            </section>

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
                        Join thousands of developers who landed their dream jobs
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
                    <p>© 2026 DSA Revision System. Built for developers, by developers.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
