import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronUp, CheckCircle, Circle,
    ExternalLink, Plus, Trophy, LineChart, Layers, Trash2, Github, Globe, Sparkles
} from 'lucide-react';
import listService from '../services/listService';

const CuratedListsPage = () => {
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Modals
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);

    // State for creating new entries
    const [selectedSection, setSelectedSection] = useState(null);
    const [newPatternTitle, setNewPatternTitle] = useState('');
    const [newProblem, setNewProblem] = useState({
        title: '',
        url: '',
        platform: 'LeetCode',
        difficulty: 'Medium'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const data = await listService.getListByName("Sarthak's List");
            setList(data);
            if (data?.sections?.length > 0 && Object.keys(expandedSections).length === 0) {
                setExpandedSections({ [data.sections[0]._id]: true });
            }
        } catch (err) {
            console.error("Error fetching list:", err);
            setError("Could not load the list. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const handleCreatePattern = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await listService.createSection(list._id, newPatternTitle);
            await fetchList();
            setIsPatternModalOpen(false);
            setNewPatternTitle('');
        } catch (err) {
            alert("Failed to add pattern.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddProblem = async (e) => {
        e.preventDefault();
        if (!selectedSection) return;
        setSubmitting(true);
        try {
            await listService.addProblemToList(list._id, selectedSection, newProblem);
            await fetchList();
            setIsProblemModalOpen(false);
            setNewProblem({ title: '', url: '', platform: 'LeetCode', difficulty: 'Medium' });
        } catch (err) {
            alert("Failed to add problem.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSection = async (e, sectionId) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this pattern and all its problems?")) return;
        try {
            // Optimistic Update
            const updatedSections = list.sections.filter(s => s._id !== sectionId);
            setList({ ...list, sections: updatedSections });
            await listService.deleteSection(list._id, sectionId);
        } catch (err) {
            console.error(err);
            fetchList();
        }
    }

    const handleDeleteProblem = async (e, sectionId, problemId) => {
        e.stopPropagation(); // vital
        if (!window.confirm("Delete this problem?")) return;
        try {
            // Optimistic Update
            const updatedSections = list.sections.map(section => {
                if (section._id === sectionId) {
                    return {
                        ...section,
                        problems: section.problems.filter(p => p._id !== problemId)
                    };
                }
                return section;
            });
            setList({ ...list, sections: updatedSections });
            await listService.deleteProblem(list._id, sectionId, problemId);
        } catch (err) {
            console.error(err);
            fetchList();
        }
    }

    const handleToggleCompletion = async (sectionId, problemId, e) => {
        e.stopPropagation();
        try {
            const updatedSections = list.sections.map(section => {
                if (section._id === sectionId) {
                    return {
                        ...section,
                        problems: section.problems.map(p => {
                            if (p._id === problemId) {
                                return { ...p, isCompleted: !p.isCompleted };
                            }
                            return p;
                        })
                    };
                }
                return section;
            });
            setList({ ...list, sections: updatedSections });
            await listService.toggleProblemCompletion(list._id, sectionId, problemId);
        } catch (err) {
            fetchList();
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center text-red-400">
            {error}
        </div>
    );

    if (!list) return null;

    let total = 0, solved = 0;
    list.sections.forEach(s => s.problems.forEach(p => {
        total++;
        if (p.isCompleted) solved++;
    }));
    const progress = total === 0 ? 0 : Math.round((solved / total) * 100);

    return (
        <div className="min-h-screen bg-[#030014] text-white p-6 md:p-12 font-sans selection:bg-fuchsia-500/30 overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-14 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <Sparkles size={14} className="text-yellow-300" />
                        <span className="text-xs font-semibold text-slate-200 tracking-widest uppercase">Official DSA Curriculum</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400 mb-6 tracking-tight drop-shadow-2xl">
                        {list.name}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        {list.description || "Master Data Structures & Algorithms with this curated path."}
                    </p>
                </motion.div>

                {/* PREMIUM PROGRESS BAR */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative bg-gradient-to-b from-[#1a103c]/80 to-[#0a0a0b]/90 border border-white/10 p-8 rounded-3xl mb-16 shadow-[0_0_40px_rgba(139,92,246,0.15)] backdrop-blur-xl overflow-hidden"
                >
                    {/* Glow Effects */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
                    <div className="absolute -left-10 -top-10 w-40 h-40 bg-violet-600/20 blur-[60px]" />

                    <div className="flex flex-col md:flex-row justify-between items-end mb-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 text-slate-300 mb-3">
                                <Trophy className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={20} />
                                <span className="font-bold tracking-wide uppercase text-sm text-violet-200">Total Mastery</span>
                            </div>
                            <div className="text-5xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{solved}</span>
                                <span className="text-2xl text-slate-600 font-medium">/ {total} Problems</span>
                            </div>
                        </div>
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white drop-shadow-lg">
                            {progress}%
                        </div>
                    </div>

                    {/* The Bar */}
                    <div className="h-5 w-full bg-slate-800/50 rounded-full overflow-hidden relative shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-500"
                        >
                            {/* Shimmer Effect */}
                            <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 w-1/2"
                            />
                            {/* End Glow */}
                            <div className="absolute right-0 top-0 bottom-0 w-[5px] bg-white/50 blur-[2px]" />
                        </motion.div>
                    </div>
                    <div className="flex justify-between mt-3 text-xs font-medium text-slate-500 uppercase tracking-widest">
                        <span>Beginner</span>
                        <span>Expert</span>
                    </div>
                </motion.div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/10 shadow-lg">
                            <Layers size={20} className="text-violet-300" />
                        </span>
                        Learning Modules
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsPatternModalOpen(true)}
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-2 ring-white/50 ring-offset-2 ring-offset-[#030014]"
                    >
                        <Plus size={18} strokeWidth={3} />
                        New Module
                    </motion.button>
                </div>

                {/* Content List */}
                <div className="space-y-4">
                    {list.sections.map((section, idx) => (
                        <motion.div
                            key={section._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group/section bg-[#0e0e12]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/10"
                        >
                            <div
                                onClick={() => toggleSection(section._id)}
                                className="w-full p-5 flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-3.5 rounded-xl transition-colors duration-300 ${expandedSections[section._id] ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 group-hover/section:text-white'}`}>
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold transition-colors ${expandedSections[section._id] ? 'text-white' : 'text-slate-300 group-hover/section:text-white'}`}>
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-0.5">{section.problems.length} Challenges</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Delete Section Button */}
                                    <button
                                        onClick={(e) => handleDeleteSection(e, section._id)}
                                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover/section:opacity-100"
                                        title="Delete Section"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className={`p-2 rounded-full bg-white/5 text-slate-400 transition-transform duration-300 ${expandedSections[section._id] ? 'rotate-180 bg-white/10 text-white' : ''}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedSections[section._id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "circOut" }}
                                    >
                                        <div className="p-2 pb-6 px-6 border-t border-white/5 space-y-2.5">
                                            {section.problems.length === 0 ? (
                                                <div className="text-center py-10 text-slate-600 italic text-sm">
                                                    No problems yet. Add some to get started!
                                                </div>
                                            ) : (
                                                section.problems.map((problem) => (
                                                    <motion.div
                                                        key={problem._id}
                                                        layout
                                                        className={`group/problem relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${problem.isCompleted
                                                                ? 'bg-green-500/5 border-green-500/20'
                                                                : 'bg-[#18181b]/50 border-white/5 hover:bg-white/[0.03] hover:border-violet-500/20'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <button
                                                                onClick={(e) => handleToggleCompletion(section._id, problem._id, e)}
                                                                className={`flex-shrink-0 transition-transform active:scale-90 ${problem.isCompleted ? 'text-green-500' : 'text-slate-600 hover:text-slate-400'}`}
                                                            >
                                                                {problem.isCompleted
                                                                    ? <CheckCircle size={24} fill="currentColor" className="text-green-500 bg-black rounded-full" />
                                                                    : <Circle size={24} strokeWidth={1.5} />
                                                                }
                                                            </button>
                                                            <div className="min-w-0">
                                                                <a
                                                                    href={problem.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`text-[15px] font-semibold truncate block hover:text-violet-400 transition-colors ${problem.isCompleted ? 'text-slate-500 line-through decoration-slate-700' : 'text-slate-200'}`}
                                                                >
                                                                    {problem.title}
                                                                </a>
                                                                <div className="flex gap-2 mt-2">
                                                                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border tracking-wider ${problem.difficulty === 'Easy' ? 'bg-green-900/20 text-green-400 border-green-500/20' :
                                                                            problem.difficulty === 'Medium' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20' :
                                                                                problem.difficulty === 'Hard' ? 'bg-red-900/20 text-red-400 border-red-500/20' :
                                                                                    'bg-slate-800 text-slate-400 border-slate-700'
                                                                        }`}>
                                                                        {problem.difficulty || 'N/A'}
                                                                    </span>
                                                                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-slate-800/50 text-slate-400 border border-slate-700/50 flex items-center gap-1.5 hover:bg-slate-800 transition-colors">
                                                                        {problem.platform === 'LeetCode' ? <Globe size={11} /> : <Github size={11} />}
                                                                        {problem.platform}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover/problem:opacity-100 transition-opacity duration-200">
                                                            <a
                                                                href={problem.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </a>
                                                            <button
                                                                onClick={(e) => handleDeleteProblem(e, section._id, problem._id)}
                                                                className="p-2 text-slate-500 hover:text-red-400 bg-white/5 rounded-lg hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}

                                            <button
                                                onClick={() => {
                                                    setSelectedSection(section.title);
                                                    setIsProblemModalOpen(true);
                                                }}
                                                className="w-full mt-4 py-4 rounded-xl border border-dashed border-white/5 text-slate-500 hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium group/add"
                                            >
                                                <Plus size={18} className="group-hover/add:scale-110 transition-transform" />
                                                Add Challenge to {section.title}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Pattern Modal */}
            <AnimatePresence>
                {isPatternModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setIsPatternModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#121214] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10"
                        >
                            <h3 className="text-2xl font-bold text-white mb-2">Create New Module</h3>
                            <p className="text-sm text-slate-400 mb-8">Group your algorithms by pattern or topic.</p>

                            <form onSubmit={handleCreatePattern}>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Module Name</label>
                                        <input
                                            autoFocus
                                            value={newPatternTitle}
                                            onChange={(e) => setNewPatternTitle(e.target.value)}
                                            placeholder="e.g. Dynamic Programming"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-lg"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setIsPatternModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newPatternTitle || submitting}
                                        className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                                    >
                                        {submitting ? 'Creating...' : 'Create Module'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Problem Modal */}
            <AnimatePresence>
                {isProblemModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setIsProblemModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#121214] border border-white/10 w-full max-w-lg p-8 rounded-3xl shadow-2xl relative z-10"
                        >
                            <h3 className="text-2xl font-bold text-white mb-2">New Challenge</h3>
                            <p className="text-sm text-slate-400 mb-8">Add to <span className="text-violet-400 font-bold">{selectedSection}</span></p>

                            <form onSubmit={handleAddProblem} className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Problem Title</label>
                                    <input
                                        required
                                        value={newProblem.title}
                                        onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                                        placeholder="e.g. Two Sum"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Problem URL</label>
                                    <input
                                        required
                                        type="url"
                                        value={newProblem.url}
                                        onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })}
                                        placeholder="https://leetcode.com/..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Platform</label>
                                        <div className="relative">
                                            <select
                                                value={newProblem.platform}
                                                onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white appearance-none focus:outline-none focus:border-violet-500/50 cursor-pointer"
                                            >
                                                <option value="LeetCode">LeetCode</option>
                                                <option value="GeeksForGeeks">GeeksForGeeks</option>
                                                <option value="CodeStudio">CodeStudio</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Difficulty</label>
                                        <div className="relative">
                                            <select
                                                value={newProblem.difficulty}
                                                onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white appearance-none focus:outline-none focus:border-violet-500/50 cursor-pointer"
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setIsProblemModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                                    >
                                        {submitting ? 'Adding...' : 'Add Challenge'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CuratedListsPage;
