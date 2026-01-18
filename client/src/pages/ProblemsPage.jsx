import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle, Clock, RefreshCw, ExternalLink, Grid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import { fetchProblems, deleteProblem, markAsRevised, fetchPatterns } from '../services/api';
import { TOPICS, DIFFICULTIES } from '../utils/constants';

const ProblemsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [problems, setProblems] = useState([]);
    const [patterns, setPatterns] = useState([]); // State for patterns
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    const [filters, setFilters] = useState({
        topic: '',
        difficulty: '',
        pattern: '', // Added pattern filter
        company: '', // Added company filter
        sort: 'created_at',
        order: 'desc'
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const company = params.get('company');
        if (company) {
            setFilters(prev => ({ ...prev, company }));
        }
    }, [location.search]);

    useEffect(() => {
        loadProblems();
        loadPatterns(); // Load patterns on mount
    }, [filters]);

    const loadPatterns = async () => {
        try {
            const data = await fetchPatterns();
            // transform for CustomSelect {value, label}
            const patternsList = data.patterns || [];
            const patternOptions = patternsList.map(p => ({ value: p, label: p }));
            setPatterns(patternOptions);
        } catch (err) {
            console.error('Failed to load patterns:', err);
        }
    };

    const loadProblems = async () => {
        try {
            setLoading(true);
            const data = await fetchProblems(); // remove filters arg, filtering client side for now/or standard query
            setProblems(data.problems);
        } catch (err) {
            console.error('Failed to load problems:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoTag = async () => {
        try {
            setLoading(true);
            // Call the auto-tag endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patterns/auto-tag`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                await loadProblems();
                alert('Auto-tagging complete! Patterns assigned based on topic/title.');
            }
        } catch (err) {
            console.error('Auto-tag failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this problem?')) {
            await deleteProblem(id);
            loadProblems();
        }
    };

    const handleQuickRevise = async (id, e) => {
        e.stopPropagation();
        try {
            await markAsRevised(id, { notes: 'Quick revision' });
            loadProblems();
        } catch (err) {
            console.error('Failed to mark as revised:', err);
        }
    };

    // Filter problems
    const filteredProblems = problems.filter(problem => {
        const matchSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchTopic = !filters.topic || problem.topic === filters.topic;
        const matchDifficulty = !filters.difficulty || problem.difficulty === filters.difficulty;
        const matchPattern = !filters.pattern || (problem.patterns && problem.patterns.includes(filters.pattern));
        const matchCompany = !filters.company || (problem.companies && problem.companies.includes(filters.company));
        return matchSearch && matchTopic && matchDifficulty && matchPattern && matchCompany;
    });

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 bg-green-500/20 border-green-500/50';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
            case 'Hard': return 'text-red-400 bg-red-500/20 border-red-500/50';
            default: return 'text-white/60 bg-white/10 border-white/20';
        }
    };

    const ProblemCard = ({ problem }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate(`/problems/${problem.id}`)}
            className="glass-card p-6 cursor-pointer group relative overflow-hidden"
        >
            {/* Solved indicator */}
            {problem.isSolved && (
                <div className="absolute top-4 right-4">
                    <CheckCircle className="text-green-400" size={24} />
                </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold mb-3 pr-8 group-hover:text-primary transition-colors">
                {problem.title}
            </h3>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/50">
                    {problem.topic}
                </span>
                {/* Patterns Badge */}
                {problem.patterns && problem.patterns.map(p => (
                    <span key={p} className="px-3 py-1 rounded-full text-xs bg-pink-500/20 text-pink-400 border border-pink-500/50">
                        {p}
                    </span>
                ))}

                {problem.revision_count > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center gap-1">
                        <RefreshCw size={12} />
                        {problem.revision_count}
                    </span>
                )}
            </div>

            {/* Next reminder */}
            {problem.next_reminder_date && (
                <div className="text-sm text-white/60 flex items-center gap-2 mb-4">
                    <Clock size={14} />
                    Next: {new Date(problem.next_reminder_date).toLocaleDateString()}
                </div>
            )}

            {/* Quick Actions (show on hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/problems/${problem.id}`);
                    }}
                    className="flex-1 py-2 px-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <Edit2 size={14} />
                    Edit
                </button>
                <button
                    onClick={(e) => handleQuickRevise(problem.id, e)}
                    className="flex-1 py-2 px-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <RefreshCw size={14} />
                    Revise
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(problem.id);
                    }}
                    className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );

    const ProblemListItem = ({ problem }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => navigate(`/problems/${problem.id}`)}
            className="glass-card p-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between group"
        >
            <div className="flex items-center gap-4 flex-1">
                {problem.isSolved && <CheckCircle className="text-green-400" size={20} />}
                <div className="flex-1">
                    <div className="font-semibold group-hover:text-primary transition-colors">{problem.title}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-sm text-white/60">{problem.topic}</span>
                        {problem.patterns && problem.patterns.map(p => (
                            <span key={p} className="text-xs text-pink-400 bg-pink-500/10 px-2 rounded">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                </span>
                {problem.revision_count > 0 && (
                    <span className="text-sm text-white/60">{problem.revision_count} revisions</span>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                    <button
                        onClick={(e) => handleQuickRevise(problem.id, e)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(problem.id);
                        }}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen p-6 max-w-7xl mx-auto">
            {/* ... Header ... */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-5xl font-bold text-gradient mb-2">All Problems</h1>
                    <p className="text-white/60">{filteredProblems.length} problems tracked</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleAutoTag}
                        className="bg-white/10 border border-white/20 px-4 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-all text-pink-400"
                    >
                        <RefreshCw size={20} />
                        Auto-Tag Patterns
                    </button>
                    <button
                        onClick={() => navigate('/problems/new')}
                        className="bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus size={20} />
                        Add Problem
                    </button>
                </div>
            </motion.div>

            {/* Filters & Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 mb-6 relative z-50"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-[#1C1C1E] border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                        />
                    </div>

                    {/* Topic Filter */}
                    <div className="z-30">
                        <CustomSelect
                            placeholder="All Topics"
                            options={[{ value: '', label: 'All Topics' }, ...TOPICS.map(t => ({ value: t, label: t }))]}
                            value={filters.topic}
                            onChange={(val) => setFilters({ ...filters, topic: val })}
                        />
                    </div>

                    {/* Difficulty Filter */}
                    <div className="z-20">
                        <CustomSelect
                            placeholder="All Difficulties"
                            options={[{ value: '', label: 'All Difficulties' }, ...DIFFICULTIES.map(d => ({ value: d, label: d }))]}
                            value={filters.difficulty}
                            onChange={(val) => setFilters({ ...filters, difficulty: val })}
                        />
                    </div>

                    {/* Pattern Filter */}
                    <div className="z-10">
                        <CustomSelect
                            placeholder="All Patterns"
                            options={[{ value: '', label: 'All Patterns' }, ...patterns]}
                            value={filters.pattern}
                            onChange={(val) => setFilters({ ...filters, pattern: val })}
                        />
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 mt-4">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-white/60 hover:bg-white/5'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-white/60 hover:bg-white/5'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Problems Display */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : filteredProblems.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-20 text-center"
                >
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-2xl font-bold mb-2">No problems yet</h3>
                    <p className="text-white/60 mb-6">Start tracking your DSA journey</p>
                    <button
                        onClick={() => navigate('/problems/new')}
                        className="bg-primary px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
                    >
                        Add Your First Problem
                    </button>
                </motion.div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProblems.map(problem => (
                            <ProblemCard key={problem.id} problem={problem} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredProblems.map(problem => (
                            <ProblemListItem key={problem.id} problem={problem} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ProblemsPage;
