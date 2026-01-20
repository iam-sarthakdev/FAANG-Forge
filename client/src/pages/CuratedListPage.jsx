import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronUp, CheckCircle, Circle,
    ExternalLink, Plus, Trophy, LineChart, Layers, Trash2, Github, Globe
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
            // Default expand first section if exists and not yet set
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
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleCreatePattern = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await listService.createSection(list._id, newPatternTitle);
            await fetchList(); // Refresh list to get new ID
            setIsPatternModalOpen(false);
            setNewPatternTitle('');
        } catch (err) {
            console.error("Failed to add pattern:", err);
            alert("Failed to add pattern. Ensure it has a unique name.");
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
            console.error("Failed to add problem:", err);
            alert("Failed to add problem.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleCompletion = async (sectionId, problemId, e) => {
        e.stopPropagation();
        try {
            // Optimistic Update
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
            console.error("Failed to toggle:", err);
            fetchList(); // Revert on error
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-red-400">
            {error}
        </div>
    );

    if (!list) return null;

    // Calc Progress
    let total = 0, solved = 0;
    list.sections.forEach(s => s.problems.forEach(p => {
        total++;
        if (p.isCompleted) solved++;
    }));
    const progress = total === 0 ? 0 : Math.round((solved / total) * 100);

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-6 md:p-12 font-sans selection:bg-violet-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <Layers size={14} className="text-violet-400" />
                        <span className="text-xs font-medium text-slate-300 tracking-wider uppercase">Official Curriculum</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-slate-500 mb-6 tracking-tight">
                        {list.name}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        {list.description || "Master Data Structures & Algorithms with this curated path."}
                    </p>
                </motion.div>

                {/* Progress Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl mb-12 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex flex-col md:flex-row justify-between items-end mb-4 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 text-slate-300 mb-2">
                                <Trophy className="text-yellow-400" size={20} />
                                <span className="font-semibold tracking-wide uppercase text-sm">Course Progress</span>
                            </div>
                            <div className="text-4xl font-bold text-white tracking-tight">
                                {solved} <span className="text-2xl text-slate-500 font-medium">/ {total} Problems</span>
                            </div>
                        </div>
                        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            {progress}%
                        </div>
                    </div>

                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative z-10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                        />
                    </div>
                </motion.div>

                {/* Action Bar */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                            <LineChart size={18} className="text-violet-400" />
                        </span>
                        Learning Patterns
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsPatternModalOpen(true)}
                        className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/5"
                    >
                        <Plus size={18} />
                        Add New Pattern
                    </motion.button>
                </div>

                {/* Patterns List */}
                <div className="space-y-4">
                    {list.sections.map((section, idx) => (
                        <motion.div
                            key={section._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-[#121214]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/10 transition-colors"
                        >
                            <div
                                onClick={() => toggleSection(section._id)}
                                className="w-full p-6 flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-colors ${expandedSections[section._id] ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold transition-colors ${expandedSections[section._id] ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                            {section.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">{section.problems.length} Challenges</p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-full bg-white/5 text-slate-400 transition-transform duration-300 ${expandedSections[section._id] ? 'rotate-180 bg-white/10 text-white' : ''}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedSections[section._id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-2 pb-6 px-6 border-t border-white/5 space-y-2">
                                            {section.problems.length === 0 ? (
                                                <div className="text-center py-8 text-slate-500 italic text-sm">
                                                    No problems added yet. Start your journey!
                                                </div>
                                            ) : (
                                                section.problems.map((problem) => (
                                                    <motion.div
                                                        key={problem._id}
                                                        layout
                                                        className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${problem.isCompleted
                                                                ? 'bg-green-500/5 border-green-500/10'
                                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <button
                                                                onClick={(e) => handleToggleCompletion(section._id, problem._id, e)}
                                                                className={`flex-shrink-0 transition-transform active:scale-90 ${problem.isCompleted ? 'text-green-500' : 'text-slate-600 hover:text-slate-400'}`}
                                                            >
                                                                {problem.isCompleted
                                                                    ? <CheckCircle size={22} fill="currentColor" className="text-green-500 bg-black rounded-full" />
                                                                    : <Circle size={22} strokeWidth={1.5} />
                                                                }
                                                            </button>
                                                            <div className="min-w-0">
                                                                <a
                                                                    href={problem.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`text-[15px] font-medium truncate block hover:underline ${problem.isCompleted ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200 decoration-violet-500'}`}
                                                                >
                                                                    {problem.title}
                                                                </a>
                                                                <div className="flex gap-2 mt-1.5">
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                                problem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                                    'bg-slate-800 text-slate-400 border-slate-700'
                                                                        }`}>
                                                                        {problem.difficulty || 'N/A'}
                                                                    </span>
                                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                                                                        {problem.platform === 'LeetCode' ? <Globe size={10} /> : <Github size={10} />}
                                                                        {problem.platform}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={problem.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    </motion.div>
                                                ))
                                            )}

                                            <button
                                                onClick={() => {
                                                    setSelectedSection(section.title);
                                                    setIsProblemModalOpen(true);
                                                }}
                                                className="w-full mt-4 py-3 rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                            >
                                                <Plus size={16} />
                                                Add Problem to {section.title}
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
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsPatternModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#18181b] border border-white/10 w-full max-w-md p-6 rounded-2xl shadow-2xl relative z-10"
                        >
                            <h3 className="text-xl font-bold text-white mb-1">Create New Pattern</h3>
                            <p className="text-sm text-slate-400 mb-6">Group your problems by topic or strategy.</p>

                            <form onSubmit={handleCreatePattern}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Pattern Name</label>
                                        <input
                                            autoFocus
                                            value={newPatternTitle}
                                            onChange={(e) => setNewPatternTitle(e.target.value)}
                                            placeholder="e.g. Graph Theory, Dynamic Programming"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsPatternModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newPatternTitle || submitting}
                                        className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
                                    >
                                        {submitting ? 'Creating...' : 'Create Pattern'}
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
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsProblemModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#18181b] border border-white/10 w-full max-w-lg p-6 rounded-2xl shadow-2xl relative z-10"
                        >
                            <h3 className="text-xl font-bold text-white mb-1">Add New Problem</h3>
                            <p className="text-sm text-slate-400 mb-6">Add a challenge to <span className="text-violet-400 font-medium">{selectedSection}</span></p>

                            <form onSubmit={handleAddProblem} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Title</label>
                                    <input
                                        required
                                        value={newProblem.title}
                                        onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                                        placeholder="Problem Title"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">URL</label>
                                    <input
                                        required
                                        type="url"
                                        value={newProblem.url}
                                        onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Platform</label>
                                        <div className="relative">
                                            <select
                                                value={newProblem.platform}
                                                onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-violet-500/50"
                                            >
                                                <option value="LeetCode">LeetCode</option>
                                                <option value="GeeksForGeeks">GeeksForGeeks</option>
                                                <option value="CodeStudio">CodeStudio</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Difficulty</label>
                                        <div className="relative">
                                            <select
                                                value={newProblem.difficulty}
                                                onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-violet-500/50"
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsProblemModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                                    >
                                        {submitting ? 'Adding...' : 'Add Problem'}
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
