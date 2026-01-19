import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, ChevronRight, TrendingUp, Briefcase, Star, Zap, Award, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllCompanies } from '../services/companyProblemsApi';

const CompaniesPage = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchAllCompanies();

            if (data && data.companies) {
                const sorted = data.companies.sort((a, b) => b.problemCount - a.problemCount);
                setCompanies(sorted);
            } else {
                setCompanies([]);
            }
        } catch (err) {
            console.error('Failed to load companies:', err);
            setError('Failed to load companies. Please try again later.');
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Company tier classification
    const getCompanyTier = (name) => {
        const faang = ['Google', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Microsoft'];
        const topTier = ['Goldman Sachs', 'Uber', 'Airbnb', 'LinkedIn', 'Adobe', 'Salesforce', 'Oracle', 'IBM'];

        if (faang.includes(name)) return { tier: 'FAANG', color: 'from-amber-500 to-orange-500', badge: 'text-amber-400 bg-amber-500/20 border-amber-500/50' };
        if (topTier.includes(name)) return { tier: 'Top Tier', color: 'from-indigo-500 to-purple-500', badge: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/50' };
        return { tier: null, color: 'from-slate-500 to-slate-600', badge: '' };
    };

    const getCompanyIcon = (name) => {
        const iconMap = {
            'Google': '🔍',
            'Amazon': '📦',
            'Meta': '👥',
            'Apple': '🍎',
            'Microsoft': '💼',
            'Netflix': '🎬',
            'Goldman Sachs': '💰',
            'Uber': '🚗',
            'Airbnb': '🏠',
            'LinkedIn': '💼',
            'Adobe': '🎨',
            'Salesforce': '☁️',
            'Oracle': '🔷',
            'IBM': '💻',
        };
        return iconMap[name] || '🏢';
    };

    const SkeletonCard = () => (
        <div className="glass-card p-5 animate-pulse">
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-white/10 rounded-xl" />
                <div className="flex-1">
                    <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
            </div>
        </div>
    );

    const stats = {
        totalCompanies: companies.length,
        totalProblems: companies.reduce((sum, c) => sum + c.problemCount, 0),
        faangCount: companies.filter(c => getCompanyTier(c.name).tier === 'FAANG').length,
    };

    return (
        <div className="min-h-screen p-6 lg:p-10 max-w-[1800px] mx-auto pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                                <Briefcase className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                                    Top Companies
                                </h1>
                                <p className="text-slate-400 text-sm mt-2">
                                    Practice problems from {stats.totalCompanies} leading tech companies
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-5 border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Building2 className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Companies</p>
                                <p className="text-2xl font-bold text-white">{stats.totalCompanies}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-5 border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <Code className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Problems</p>
                                <p className="text-2xl font-bold text-white">{stats.totalProblems}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-5 border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500/20 rounded-lg">
                                <Star className="text-amber-400" size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">FAANG Companies</p>
                                <p className="text-2xl font-bold text-white">{stats.faangCount}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative group max-w-2xl"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </motion.div>
            </motion.div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : error ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-16 text-center border border-white/10"
                >
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{error}</h3>
                    <button
                        onClick={loadCompanies}
                        className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
                    >
                        Try Again
                    </button>
                </motion.div>
            ) : (
                <AnimatePresence mode="wait">
                    {filteredCompanies.length > 0 ? (
                        <motion.div
                            key="companies-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                        >
                            {filteredCompanies.map((company, index) => {
                                const tier = getCompanyTier(company.name);
                                return (
                                    <motion.div
                                        key={company.name}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.03, duration: 0.3 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        onClick={() => navigate(`/problems?company=${encodeURIComponent(company.name)}`)}
                                        className="glass-card p-5 cursor-pointer group relative overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300"
                                    >
                                        {/* Glow effect */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />

                                        <div className="relative">
                                            {/* Tier Badge */}
                                            {tier.tier && (
                                                <div className="absolute -top-2 -right-2">
                                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.badge} flex items-center gap-1`}>
                                                        <Star size={10} />
                                                        {tier.tier}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Icon & Content */}
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className={`p-3 bg-gradient-to-br ${tier.color} rounded-xl shadow-lg flex-shrink-0 text-2xl`}>
                                                    {getCompanyIcon(company.name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition-all truncate">
                                                        {company.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-400">
                                                        {company.problemCount} Problems
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                <span className="text-xs text-slate-500 font-medium">View Questions</span>
                                                <ChevronRight className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" size={16} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-card p-20 text-center border border-white/10"
                        >
                            <div className="text-6xl mb-6">🔍</div>
                            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                No companies found
                            </h3>
                            <p className="text-slate-400 mb-8">
                                Try adjusting your search for "{searchQuery}"
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
                            >
                                Clear Search
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default CompaniesPage;
