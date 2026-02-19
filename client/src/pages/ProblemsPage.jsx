import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle, Clock, RefreshCw, ExternalLink, Grid, List, Building2, Sparkles, Target, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import { fetchProblems, deleteProblem, markAsRevised, fetchPatterns } from '../services/api';
import { fetchCompanyProblems } from '../services/companyProblemsApi';
import { TOPICS, DIFFICULTIES } from '../utils/constants';

const ProblemsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const getInitialFilters = () => {
        const params = new URLSearchParams(location.search);
        return {
            topic: '',
            difficulty: '',
            pattern: '',
            company: params.get('company') || '',
            sort: 'created_at',
            order: 'desc'
        };
    };

    const [filters, setFilters] = useState(getInitialFilters());
    const [userProblems, setUserProblems] = useState([]);
    const [companyProblems, setCompanyProblems] = useState([]);
    const [totalCount, setTotalCount] = useState(0); // Add total count state
    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [showSource, setShowSource] = useState('all'); // specific default

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadAllProblems();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery, filters, showSource]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const company = params.get('company');
        if (company && company !== filters.company) {
            setFilters(prev => ({ ...prev, company }));
            setShowSource('company');
        }
    }, [location.search]);

    useEffect(() => {
        // Remove direct call to loadAllProblems on mount/filter change.
        // It is now handled by the debounce effect above.
        loadPatterns();
    }, []);

    const loadPatterns = async () => {
        try {
            const data = await fetchPatterns();
            const patternsList = data.patterns || [];
            const patternOptions = patternsList.map(p => ({ value: p, label: p }));
            setPatterns(patternOptions);
        } catch (err) {
            console.error('Failed to load patterns:', err);
        }
    };

    const loadAllProblems = async () => {
        try {
            setLoading(true);

            // Pass search query to backend
            const userData = await fetchProblems({ ...filters, search: searchQuery });

            const mappedUserProblems = (userData.problems || []).map(p => ({
                ...p,
                source: 'user',
                title: p.problem_name || p.title
            }));
            setUserProblems(mappedUserProblems);
            setTotalCount(userData.total || mappedUserProblems.length); // Update total count

            // Fetch company problems for both 'all' and 'company' tabs
            if (showSource === 'company' || showSource === 'all') {
                try {
                    const companyData = await fetchCompanyProblems({ ...filters, limit: 200, search: searchQuery });
                    const mappedCompanyProblems = (companyData.problems || []).map(p => ({
                        ...p,
                        source: 'company',
                        id: p._id,
                        problem_name: p.title,
                        topic: p.topics?.[0] || 'Unknown'
                    }));
                    setCompanyProblems(mappedCompanyProblems);
                } catch (err) {
                    console.error('Failed to load company problems:', err);
                    setCompanyProblems([]);
                }
            } else {
                setCompanyProblems([]);
            }
        } catch (err) {
            console.error('Failed to load problems:', err);
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async (id) => {
        if (window.confirm('Delete this problem?')) {
            await deleteProblem(id);
            loadAllProblems();
        }
    };

    const handleQuickRevise = async (id, e) => {
        e.stopPropagation();
        try {
            await markAsRevised(id, { notes: 'Quick revision' });
            loadAllProblems();
        } catch (err) {
            console.error('Failed to mark as revised:', err);
        }
    };

    const combinedProblems = showSource === 'user' ? userProblems
        : showSource === 'company' ? companyProblems
            : [...userProblems, ...companyProblems]; // For "all", combine both user and company problems

    // No client-side filtering needed as backend handles it now
    const filteredProblems = combinedProblems;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
            case 'Medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/50';
            case 'Hard': return 'text-rose-400 bg-rose-500/20 border-rose-500/50';
            default: return 'text-white/60 bg-white/10 border-white/20';
        }
    };

    const handleProblemClick = (problem) => {
        if (problem.source === 'company') {
            navigate('/problems/new', {
                state: {
                    importedProblem: {
                        title: problem.title,
                        url: problem.url,
                        topic: problem.topic,
                        difficulty: problem.difficulty,
                        companies: problem.companies || [filters.company].filter(Boolean)
                    }
                }
            });
        } else {
            navigate(`/problems/${problem.id}`);
        }
    };

    const ProblemCard = ({ problem, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => handleProblemClick(problem)}
            className="glass-card p-6 cursor-pointer group relative overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300"
        >
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />

            <div className="relative">
                {/* Solved indicator */}
                {problem.isSolved && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-lg shadow-emerald-500/50">
                        <CheckCircle className="text-white" size={20} />
                    </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-bold mb-3 pr-6 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
                    {problem.title}
                </h3>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                        {problem.topic}
                    </span>
                    {problem.patterns && problem.patterns.slice(0, 2).map(p => (
                        <span key={p} className="px-2.5 py-1 rounded-full text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 font-medium">
                            {p}
                        </span>
                    ))}
                    {problem.revision_count > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-medium">
                            <RefreshCw size={10} />
                            {problem.revision_count}
                        </span>
                    )}
                </div>

                {/* Next reminder */}
                {problem.next_reminder_date && (
                    <div className="text-xs text-slate-400 flex items-center gap-2 mb-3">
                        <Clock size={12} />
                        Next: {new Date(problem.next_reminder_date).toLocaleDateString()}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleProblemClick(problem);
                        }}
                        className="flex-1 py-2 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-indigo-500/20"
                    >
                        <Edit2 size={12} />
                        {problem.source === 'company' ? 'Import' : 'Edit'}
                    </button>
                    {problem.source !== 'company' && (
                        <>
                            <button
                                onClick={(e) => handleQuickRevise(problem.id, e)}
                                className="flex-1 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-emerald-500/20"
                            >
                                <RefreshCw size={12} />
                                Revise
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(problem.id);
                                }}
                                className="py-2 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs transition-colors border border-rose-500/20"
                            >
                                <Trash2 size={12} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const ProblemListItem = ({ problem, index }) => (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => handleProblemClick(problem)}
            className="glass-card p-5 cursor-pointer hover:bg-white/5 transition-all duration-300 flex items-center justify-between group border border-white/5 hover:border-white/10"
        >
            <div className="flex items-center gap-4 flex-1">
                {problem.isSolved && <CheckCircle className="text-emerald-400" size={20} />}
                <div className="flex-1">
                    <div className="font-bold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                        {problem.title}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-sm text-slate-400">{problem.topic}</span>
                        {problem.patterns && problem.patterns.slice(0, 3).map(p => (
                            <span key={p} className="text-xs text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                </span>
                {problem.revision_count > 0 && (
                    <span className="text-sm text-slate-400">{problem.revision_count} revisions</span>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                    {problem.source !== 'company' ? (
                        <>
                            <button
                                onClick={(e) => handleQuickRevise(problem.id, e)}
                                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                            >
                                <RefreshCw size={16} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(problem.id);
                                }}
                                className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleProblemClick(problem);
                            }}
                            className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-xs transition-colors"
                        >
                            Import
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const SkeletonCard = () => (
        <div className="glass-card p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
            <div className="flex gap-2 mb-4">
                <div className="h-6 bg-white/10 rounded w-16" />
                <div className="h-6 bg-white/10 rounded w-20" />
            </div>
            <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
    );

    const stats = {
        total: filteredProblems.length,
        solved: filteredProblems.filter(p => p.isSolved).length,
        revised: filteredProblems.reduce((sum, p) => sum + (p.revision_count || 0), 0)
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
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                                <Target className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                                    All Problems
                                </h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-slate-400 text-sm font-medium">{stats.total} Total</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                    <span className="text-emerald-400 text-sm font-medium">{stats.solved} Solved</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                    <span className="text-blue-400 text-sm font-medium">{stats.revised} Revisions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">

                        <button
                            onClick={() => navigate('/problems/new')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
                        >
                            <Plus size={20} />
                            Add Problem
                        </button>
                    </div>
                </div>

                {/* Source Filter Tabs */}
                <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10 w-fit">
                    <button
                        onClick={() => setShowSource('all')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${showSource === 'all' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setShowSource('user')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${showSource === 'user' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Your Problems
                    </button>
                    <button
                        onClick={() => setShowSource('company')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${showSource === 'company' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Building2 size={16} />
                        Company Database
                    </button>
                </div>
            </motion.div>

            {/* Filters & Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 mb-8 border border-white/10 relative z-50"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <CustomSelect
                        placeholder="All Topics"
                        options={[{ value: '', label: 'All Topics' }, ...TOPICS.map(t => ({ value: t, label: t }))]}
                        value={filters.topic}
                        onChange={(val) => setFilters({ ...filters, topic: val })}
                    />
                    <CustomSelect
                        placeholder="All Difficulties"
                        options={[{ value: '', label: 'All Difficulties' }, ...DIFFICULTIES.map(d => ({ value: d, label: d }))]}
                        value={filters.difficulty}
                        onChange={(val) => setFilters({ ...filters, difficulty: val })}
                    />
                    <CustomSelect
                        placeholder="All Patterns"
                        options={[{ value: '', label: 'All Patterns' }, ...patterns]}
                        value={filters.pattern}
                        onChange={(val) => setFilters({ ...filters, pattern: val })}
                    />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </motion.div>

            {/* Problems Display */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filteredProblems.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-20 text-center border border-white/10"
                >
                    <div className="text-6xl mb-6">🎯</div>
                    <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">No problems found</h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">Start building your problem set or adjust your filters</p>
                    <button
                        onClick={() => navigate('/problems/new')}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
                    >
                        Add Your First Problem
                    </button>
                </motion.div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProblems.map((problem, index) => (
                            <ProblemCard key={problem.id} problem={problem} index={index} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredProblems.map((problem, index) => (
                            <ProblemListItem key={problem.id} problem={problem} index={index} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ProblemsPage;

