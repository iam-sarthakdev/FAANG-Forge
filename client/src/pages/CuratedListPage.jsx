import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, CheckCircle, Circle,
    ExternalLink, Plus, Trophy, Layers, Trash2, Github, Globe, Sparkles,
    Lock, ArrowUp, ArrowDown, RefreshCw, ArrowUpDown, GripVertical
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import listService from '../services/listService';
import { useAuth } from '../context/AuthContext';

// --- Sortable Item Components ---

const SortableSectionItem = ({ section, idx, isExpanded, toggleSection, openDeleteModal, isAdmin, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section._id, disabled: !isAdmin });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto' // ensure visibility on drag
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group/section bg-[#0e0e12]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/10 mb-4"
            >
                <div
                    className="w-full p-5 flex items-center justify-between"
                >
                    <div className="flex items-center gap-5 flex-1 cursor-pointer" onClick={() => toggleSection(section._id)}>
                        {isAdmin && (
                            <div {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-2 -ml-2">
                                <GripVertical size={20} />
                            </div>
                        )}
                        <div className={`p-3.5 rounded-xl transition-colors duration-300 ${isExpanded ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 group-hover/section:text-white'}`}>
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold transition-colors ${isExpanded ? 'text-white' : 'text-slate-300 group-hover/section:text-white'}`}>
                                {section.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-0.5">{section.problems.length} Challenges</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <button
                                onClick={(e) => { e.stopPropagation(); openDeleteModal('section', section._id); }}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover/section:opacity-100"
                                title="Delete Module"
                            >
                                <Lock size={16} className="text-red-500/50" />
                            </button>
                        )}
                        <div
                            onClick={() => toggleSection(section._id)}
                            className={`p-2 rounded-full bg-white/5 text-slate-400 transition-transform duration-300 cursor-pointer ${isExpanded ? 'rotate-180 bg-white/10 text-white' : ''}`}
                        >
                            <ChevronDown size={20} />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "circOut" }}
                        >
                            <div className="p-2 pb-6 px-6 border-t border-white/5 space-y-2.5">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const SortableProblemItem = ({ problem, sectionId, idx, openDeleteModal, handleToggleCompletion, isAdmin }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: problem._id, disabled: !isAdmin });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <motion.div
                layout
                className={`group/problem relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${problem.isCompleted
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-[#18181b]/50 border-white/5 hover:bg-white/[0.03] hover:border-violet-500/20'
                    }`}
            >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {isAdmin && (
                        <div {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 -ml-1 mr-1">
                            <GripVertical size={16} />
                        </div>
                    )}

                    <button
                        onClick={(e) => handleToggleCompletion(sectionId, problem._id, e)}
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

                            {(problem.problemRef?.revision_count > 0) && (
                                <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-blue-900/20 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                    <RefreshCw size={10} />
                                    {problem.problemRef.revision_count}
                                </span>
                            )}
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
                    {isAdmin && (
                        <button
                            onClick={(e) => { e.stopPropagation(); openDeleteModal('problem', sectionId, problem._id); }}
                            className="p-2 text-slate-500 hover:text-red-400 bg-white/5 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};


const CuratedListsPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.email === 'sarthak1712005@gmail.com';

    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Modals
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);

    // Security Modal
    const [deleteModal, setDeleteModal] = useState({ open: false, type: null, sectionId: null, problemId: null });
    const [deletePassword, setDeletePassword] = useState('');
    const [verifyError, setVerifyError] = useState('');

    // Sorting & UI
    const [sortMode, setSortMode] = useState('default'); // default, easy-hard, hard-easy, revisions-desc

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

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Better for click vs drag
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    const [activeId, setActiveId] = useState(null); // For drag overlay

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const data = await listService.getListByName("Sarthak's List");
            setList(data);
            if (data?.sections?.length > 0 && Object.keys(expandedSections).length === 0) {
                const initialExpanded = {};
                data.sections.slice(0, 3).forEach(s => initialExpanded[s._id] = true);
                setExpandedSections(initialExpanded);
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

    // --- SORTING LOGIC ---
    const sortedSections = useMemo(() => {
        if (!list || !list.sections) return [];
        let sections = JSON.parse(JSON.stringify(list.sections));

        if (sortMode !== 'default') {
            sections.forEach(section => {
                if (sortMode === 'easy-hard') {
                    const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3, '': 4 };
                    section.problems.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
                } else if (sortMode === 'hard-easy') {
                    const diffOrder = { 'Easy': 3, 'Medium': 2, 'Hard': 1, '': 4 };
                    section.problems.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
                } else if (sortMode === 'revisions-desc') {
                    section.problems.sort((a, b) => (b.problemRef?.revision_count || 0) - (a.problemRef?.revision_count || 0));
                }
            });
        }
        return sections;
    }, [list, sortMode]);

    // --- DnD HANDLERS ---

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Determine if section or problem
        const isSection = list.sections.find(s => s._id === active.id);

        if (isSection) {
            if (active.id !== over.id) {
                const oldIndex = list.sections.findIndex(s => s._id === active.id);
                const newIndex = list.sections.findIndex(s => s._id === over.id);

                // Optimistic update
                const newSections = arrayMove(list.sections, oldIndex, newIndex);
                setList({ ...list, sections: newSections });

                try {
                    await listService.reorderSection(list._id, oldIndex, newIndex);
                } catch (err) {
                    fetchList(); // Revert on fail
                }
            }
        } else {
            // Problem Dragging
            // Important: We only support reorder within same section for now simplicity, 
            // or we need complex logic to determine parent section

            // Find source section
            let sourceSection = list.sections.find(s => s.problems.some(p => p._id === active.id));
            if (!sourceSection) return;

            // Find target (could be a problem or section context)
            // If dropping on a problem, find its section
            let targetSection = list.sections.find(s => s.problems.some(p => p._id === over.id));

            // Only allow reorder within same section for now
            if (targetSection && sourceSection._id === targetSection._id) {
                const oldIndex = sourceSection.problems.findIndex(p => p._id === active.id);
                const newIndex = sourceSection.problems.findIndex(p => p._id === over.id);

                if (oldIndex !== newIndex) {
                    // Optimistic
                    const updatedSections = list.sections.map(s => {
                        if (s._id === sourceSection._id) {
                            return { ...s, problems: arrayMove(s.problems, oldIndex, newIndex) };
                        }
                        return s;
                    });
                    setList({ ...list, sections: updatedSections });

                    try {
                        await listService.reorderProblem(list._id, sourceSection._id, oldIndex, newIndex);
                    } catch (err) {
                        fetchList();
                    }
                }
            }
        }

    };


    // --- ACTIONS ---

    const handleCreatePattern = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await listService.createSection(list._id, newPatternTitle);
            await fetchList();
            setIsPatternModalOpen(false);
            setNewPatternTitle('');
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add pattern.");
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
            alert(err.response?.data?.message || "Failed to add problem.");
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (type, sectionId, problemId = null) => {
        setDeleteModal({ open: true, type, sectionId, problemId });
        // Pre-fill password if user knows it? No, keep empty as requested, just display what it is.
        setDeletePassword('');
        setVerifyError('');
    };

    const confirmDelete = async (e) => {
        e.preventDefault();
        try {
            if (deleteModal.type === 'section') {
                await listService.deleteSection(list._id, deleteModal.sectionId, deletePassword);
            } else {
                await listService.deleteProblem(list._id, deleteModal.sectionId, deleteModal.problemId);
            }
            setDeleteModal({ open: false, type: null, sectionId: null, problemId: null });
            fetchList();
        } catch (err) {
            setVerifyError(err.response?.data?.message || "Incorrect Password or Failed");
        }
    };

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
        <div className="min-h-screen bg-[#030014] text-white p-6 md:p-12 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-14 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <Sparkles size={14} className="text-yellow-300" />
                        <span className="text-xs font-semibold text-slate-200 tracking-widest uppercase">Official DSA Curriculum</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400 mb-6 tracking-tight drop-shadow-2xl">
                        {list.name}
                    </h1>
                </motion.div>

                {/* Progress Bar */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-gradient-to-b from-[#1a103c]/80 to-[#0a0a0b]/90 border border-white/10 p-8 rounded-3xl mb-16 shadow-[0_0_40px_rgba(139,92,246,0.15)] backdrop-blur-xl overflow-hidden">
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
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white drop-shadow-lg">{progress}%</div>
                    </div>
                    <div className="h-5 w-full bg-slate-800/50 rounded-full overflow-hidden relative shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-500" />
                    </div>
                </motion.div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/10 shadow-lg">
                                <Layers size={20} className="text-violet-300" />
                            </span>
                            Modules
                        </h2>

                        <div className="relative group">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white cursor-pointer">
                                <ArrowUpDown size={14} />
                                <span>{sortMode === 'default' ? 'Default Order' : sortMode === 'easy-hard' ? 'Difficulty (Easy → Hard)' : sortMode === 'hard-easy' ? 'Difficulty (Hard → Easy)' : 'Most Revised'}</span>
                            </div>
                            <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-xl overflow-hidden shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <div onClick={() => setSortMode('default')} className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-slate-300 hover:text-white">Default Order</div>
                                <div onClick={() => setSortMode('easy-hard')} className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-slate-300 hover:text-white">Difficulty (Easy → Hard)</div>
                                <div onClick={() => setSortMode('hard-easy')} className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-slate-300 hover:text-white">Difficulty (Hard → Easy)</div>
                                <div onClick={() => setSortMode('revisions-desc')} className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-slate-300 hover:text-white">Most Revised</div>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsPatternModalOpen(true)}
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] ring-2 ring-white/50 ring-offset-2 ring-offset-[#030014]"
                        >
                            <Plus size={18} strokeWidth={3} />
                            New Module
                        </motion.button>
                    )}
                </div>

                {/* Content List with DnD */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedSections.map(s => s._id)}
                        strategy={verticalListSortingStrategy}
                        disabled={sortMode !== 'default' || !isAdmin}
                    >
                        <div className="space-y-4">
                            {sortedSections.map((section, idx) => (
                                <SortableSectionItem
                                    key={section._id}
                                    section={section}
                                    idx={idx}
                                    isExpanded={expandedSections[section._id]}
                                    toggleSection={toggleSection}
                                    openDeleteModal={openDeleteModal}
                                    isAdmin={isAdmin}
                                >
                                    {section.problems.length === 0 ? (
                                        <div className="text-center py-10 text-slate-600 italic text-sm">
                                            No problems yet. Add some to get started!
                                        </div>
                                    ) : (
                                        <SortableContext
                                            items={section.problems.map(p => p._id)}
                                            strategy={verticalListSortingStrategy}
                                            disabled={sortMode !== 'default' || !isAdmin}
                                        >
                                            {section.problems.map((problem, pIdx) => (
                                                <SortableProblemItem
                                                    key={problem._id}
                                                    problem={problem}
                                                    sectionId={section._id}
                                                    idx={pIdx}
                                                    openDeleteModal={openDeleteModal}
                                                    handleToggleCompletion={handleToggleCompletion}
                                                    isAdmin={isAdmin}
                                                />
                                            ))}
                                        </SortableContext>
                                    )}

                                    {isAdmin && (
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
                                    )}
                                </SortableSectionItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Pattern Modal */}
            <AnimatePresence>
                {isPatternModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsPatternModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121214] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-2">Create New Module</h3>
                            <form onSubmit={handleCreatePattern}>
                                <div className="space-y-6 mt-6">
                                    <input value={newPatternTitle} onChange={(e) => setNewPatternTitle(e.target.value)} placeholder="Module Name" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-violet-500/50 outline-none" autoFocus />
                                </div>
                                <div className="flex justify-end gap-3 mt-10">
                                    <button type="button" onClick={() => setIsPatternModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                                    <button type="submit" disabled={!newPatternTitle || submitting} className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all">{submitting ? 'Creating...' : 'Create Module'}</button>
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
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsProblemModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121214] border border-white/10 w-full max-w-lg p-8 rounded-3xl shadow-2xl relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-2">New Challenge</h3>
                            <p className="text-sm text-slate-400 mb-8">Add to <span className="text-violet-400 font-bold">{selectedSection}</span></p>
                            <form onSubmit={handleAddProblem} className="space-y-5">
                                <input required value={newProblem.title} onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })} placeholder="Title" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none" />
                                <input required type="url" value={newProblem.url} onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })} placeholder="URL" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none" />
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="relative">
                                        <select value={newProblem.platform} onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white appearance-none outline-none">
                                            <option value="LeetCode">LeetCode</option>
                                            <option value="GeeksForGeeks">GeeksForGeeks</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                    <div className="relative">
                                        <select value={newProblem.difficulty} onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3.5 text-white appearance-none outline-none">
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-10">
                                    <button type="button" onClick={() => setIsProblemModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                                    <button type="submit" disabled={submitting} className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all">{submitting ? 'Adding...' : 'Add Challenge'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE / SECURITY MODAL */}
            <AnimatePresence>
                {deleteModal.open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setDeleteModal({ ...deleteModal, open: false })} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121214] border border-red-500/20 w-full max-w-sm p-8 rounded-3xl shadow-2xl relative z-10 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 ring-1 ring-red-500/30"><Lock size={32} /></div>
                            <h3 className="text-2xl font-bold text-white mb-2">Restricted Action</h3>
                            {deleteModal.type === 'section' && (
                                <p className="text-slate-400 mb-6 text-sm">
                                    To delete this entire module, please enter the security password.<br />
                                    <span className="text-violet-400 font-mono mt-2 block">(Password: sarthak123)</span>
                                </p>
                            )}
                            {deleteModal.type !== 'section' && (
                                <p className="text-slate-400 mb-6 text-sm">Are you sure you want to delete this problem?</p>
                            )}

                            {/* Password Input for Section */}
                            {deleteModal.type === 'section' && (
                                <div className="mb-6">
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Enter Password"
                                        className="w-full text-center bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none transition-colors"
                                        autoFocus
                                    />
                                    {verifyError && <p className="text-red-400 text-xs mt-2 font-medium">{verifyError}</p>}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModal({ open: false, type: null, sectionId: null, problemId: null })} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 transition-all">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CuratedListsPage;
