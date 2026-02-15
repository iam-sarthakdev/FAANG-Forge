import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, CheckCircle, Circle,
    ExternalLink, Plus, Trophy, Layers, Trash2, Github, Globe, Sparkles,
    Lock, ArrowUp, ArrowDown, RefreshCw, ArrowUpDown, GripVertical
} from 'lucide-react';
import { markAsRevised } from '../services/api';
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
        zIndex: isDragging ? 999 : 'auto'
    };

    // Section stats
    const totalProblems = section.problems.length;
    const solvedCount = section.problems.filter(p => p.isCompleted).length;
    const totalRevisions = section.problems.reduce((acc, p) => acc + (p.revision_count || 0), 0);
    const completionPct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div
                className="group/section bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden hover:border-violet-500/20 transition-colors mb-3"
            >
                <div className="w-full p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleSection(section._id)}>
                        {isAdmin && (
                            <div {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 -ml-1">
                                <GripVertical size={18} />
                            </div>
                        )}
                        <div className={`p-2.5 rounded-lg transition-colors ${isExpanded ? 'bg-violet-600 text-white' : 'bg-white/[0.04] text-slate-400 group-hover/section:text-white'}`}>
                            <Layers size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <h3 className={`text-base font-semibold transition-colors ${isExpanded ? 'text-white' : 'text-slate-300 group-hover/section:text-white'}`}>
                                    {section.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {solvedCount}/{totalProblems} solved
                                    </span>
                                    {totalRevisions > 0 && (
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            {totalRevisions} revisions
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Mini progress bar */}
                            <div className="mt-2 h-1 w-full max-w-[200px] bg-white/[0.04] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-violet-500 rounded-full transition-all duration-500"
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <button
                                onClick={(e) => { e.stopPropagation(); openDeleteModal('section', section._id); }}
                                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover/section:opacity-100"
                                title="Delete Module"
                            >
                                <Lock size={14} className="text-red-500/50" />
                            </button>
                        )}
                        <div
                            onClick={() => toggleSection(section._id)}
                            className={`p-1.5 rounded-md bg-white/[0.04] text-slate-400 transition-transform duration-200 cursor-pointer ${isExpanded ? 'rotate-180 text-white' : ''}`}
                        >
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-2 pb-5 px-5 border-t border-white/[0.04] space-y-2">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const SortableProblemItem = ({ problem, sectionId, idx, openDeleteModal, handleToggleCompletion, handleIncrementRevision, isAdmin }) => {
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
            <div
                className={`group/problem relative flex items-center justify-between p-3.5 rounded-lg border transition-colors ${problem.isCompleted
                    ? 'bg-emerald-500/[0.04] border-emerald-500/15'
                    : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] hover:border-violet-500/15'
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
                        <div className="flex gap-2 mt-2 items-center">
                            {/* Revision Count */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
                                <RefreshCw size={12} />
                                <span>{problem.revision_count || 0}</span>
                                <button
                                    onClick={(e) => handleIncrementRevision(sectionId, problem._id, e)}
                                    className="ml-1 p-0.5 rounded hover:bg-orange-500/20 text-orange-400 transition-colors"
                                >
                                    <Plus size={10} strokeWidth={3} />
                                </button>
                            </div>

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
            </div>
        </div>
    );
};


const CuratedListsPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.email === 'sarthak1712005@gmail.com';


    // --- STATE ---
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'list'
    const [allLists, setAllLists] = useState([]);
    const [currentListId, setCurrentListId] = useState(null);
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Modal & Form States
    const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
    const [newPatternTitle, setNewPatternTitle] = useState('');
    const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [newProblem, setNewProblem] = useState({ title: '', url: '', platform: 'LeetCode', difficulty: 'Medium' });
    const [submitting, setSubmitting] = useState(false);

    // Delete/Security Modal
    const [deleteModal, setDeleteModal] = useState({ open: false, type: null, sectionId: null, problemId: null });
    const [deletePassword, setDeletePassword] = useState('');
    const [verifyError, setVerifyError] = useState('');

    // Sorting
    const [sortMode, setSortMode] = useState('default'); // 'default', 'easy-hard', 'hard-easy', 'revisions-desc'

    useEffect(() => {
        fetchAllLists();
    }, []);

    // --- Auto-Seed Logic for Admin ---
    useEffect(() => {
        if (isAdmin && !loading) {
            const hasNeetCode = allLists.some(l => l.name.includes('NeetCode'));
            if (!hasNeetCode) {
                const seed = async () => {
                    try {
                        console.log("Auto-seeding famous lists...");
                        await listService.seedFamousLists();
                        console.log("Auto-seed successful!");
                        fetchAllLists();
                    } catch (err) {
                        console.error("Auto-seed failed", err);
                    }
                };
                seed();
            }
        }
    }, [isAdmin, loading, allLists]);

    const fetchAllLists = async () => {
        try {
            const data = await listService.getLists();
            setAllLists(data);
            // If "Sarthak's List" is the only one, maybe auto-open it? 
            // But user wants Dashboard now. 
        } catch (err) {
            console.error("Error fetching lists:", err);
            setError("Could not load lists.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectList = async (listName) => {
        setLoading(true);
        try {
            const data = await listService.getListByName(listName);
            setList(data);
            setCurrentListId(data._id);
            setViewMode('list');

            // Expand first few sections
            if (data?.sections?.length > 0) {
                const initialExpanded = {};
                data.sections.slice(0, 3).forEach(s => initialExpanded[s._id] = true);
                setExpandedSections(initialExpanded);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to load ${listName}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToDashboard = () => {
        setViewMode('dashboard');
        setList(null);
        setCurrentListId(null);
        fetchAllLists(); // Refresh metadata
    };

    const handleSeedFamousLists = async () => {
        if (!confirm("This will seed/update NeetCode 150 and Striver's A2Z. Continue?")) return;
        setSubmitting(true);
        try {
            await listService.seedFamousLists();
            alert("Lists seeded successfully!");
            fetchAllLists();
        } catch (err) {
            console.error("Seeding error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error";
            alert("Seeding failed: " + errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // --- DnD Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Handlers ---
    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCreatePattern = async (e) => {
        e.preventDefault();
        if (!newPatternTitle || !currentListId || !list?.name) return;
        setSubmitting(true);
        try {
            await listService.createSection(currentListId, newPatternTitle);
            const updated = await listService.getListByName(list.name);
            setList(updated);
            setNewPatternTitle('');
            setIsPatternModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to create module");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddProblem = async (e) => {
        e.preventDefault();
        if (!selectedSection || !currentListId || !list?.name) return;
        setSubmitting(true);
        try {
            await listService.addProblemToList(currentListId, selectedSection, newProblem);
            const updated = await listService.getListByName(list.name);
            setList(updated);
            setNewProblem({ title: '', url: '', platform: 'LeetCode', difficulty: 'Medium' });
            setIsProblemModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to add problem");
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (type, sectionId, problemId = null) => {
        setDeleteModal({ open: true, type, sectionId, problemId });
        setDeletePassword('');
        setVerifyError('');
    };

    const confirmDelete = async () => {
        if (deleteModal.type === 'section') {
            if (deleteModal.type === 'section' && deletePassword !== 'sarthak123') {
                setVerifyError('Incorrect Password');
                return;
            }
            try {
                await listService.deleteSection(currentListId, deleteModal.sectionId, deletePassword);
                const updated = await listService.getListByName(list.name);
                setList(updated);
                setDeleteModal({ open: false, type: null, sectionId: null, problemId: null });
            } catch (err) {
                alert("Failed to delete section");
            }
        } else {
            try {
                await listService.deleteProblem(currentListId, deleteModal.sectionId, deleteModal.problemId);
                const updated = await listService.getListByName(list.name);
                setList(updated);
                setDeleteModal({ open: false, type: null, sectionId: null, problemId: null });
            } catch (err) {
                alert("Failed to delete problem");
            }
        }
    };

    const handleToggleCompletion = async (sectionId, problemId, e) => {
        e.stopPropagation();
        // Optimistic update
        const updatedList = { ...list };
        updatedList.sections = updatedList.sections.map(s => {
            if (s._id === sectionId) {
                return {
                    ...s,
                    problems: s.problems.map(p => {
                        if (p._id === problemId) return { ...p, isCompleted: !p.isCompleted };
                        return p;
                    })
                };
            }
            return s;
        });
        setList(updatedList);

        try {
            await listService.toggleProblemCompletion(currentListId, sectionId, problemId);
        } catch (err) {
            console.error(err);
            // Revert on error (could fetch list again)
        }
    };

    const handleIncrementRevision = async (sectionId, problemId, e) => {
        e.stopPropagation();
        // Optimistic
        const updatedList = { ...list };
        updatedList.sections = updatedList.sections.map(s => {
            if (s._id === sectionId) {
                return {
                    ...s,
                    problems: s.problems.map(p => {
                        if (p._id === problemId) return { ...p, revision_count: (p.revision_count || 0) + 1 };
                        return p;
                    })
                };
            }
            return s;
        });
        setList(updatedList);

        try {
            await listService.incrementRevision(currentListId, sectionId, problemId);
        } catch (err) {
            console.error(err);
        }
    };


    // --- Drag and Drop Handlers ---
    const [activeItem, setActiveItem] = useState(null);

    const handleDragStart = (event) => {
        const { active } = event;
        const section = list.sections.find(s => s._id === active.id);
        if (section) {
            setActiveItem({ ...section, type: 'section' });
            return;
        }
        // Find problem
        for (const s of list.sections) {
            const problem = s.problems.find(p => p._id === active.id);
            if (problem) {
                setActiveItem({ ...problem, type: 'problem' });
                return;
            }
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        const draggedItem = activeItem;
        setActiveItem(null);

        if (!over || !draggedItem) return;

        // Section Reorder
        if (draggedItem.type === 'section') {
            if (active.id !== over.id) {
                const oldIndex = list.sections.findIndex(s => s._id === active.id);
                const newIndex = list.sections.findIndex(s => s._id === over.id);

                if (oldIndex === -1 || newIndex === -1) return;

                // Optimistic
                const newSections = arrayMove(list.sections, oldIndex, newIndex);
                setList({ ...list, sections: newSections });

                try {
                    await listService.reorderSection(currentListId, oldIndex, newIndex);
                } catch (err) {
                    console.error("Section reorder failed", err);
                    const updated = await listService.getListByName(list.name);
                    setList(updated);
                }
            }
        }
        // Problem Reorder within a section
        else if (draggedItem.type === 'problem') {
            if (active.id !== over.id) {
                // Find which section contains these problems
                let targetSection = null;
                for (const s of list.sections) {
                    const hasActive = s.problems.some(p => p._id === active.id);
                    const hasOver = s.problems.some(p => p._id === over.id);
                    if (hasActive && hasOver) {
                        targetSection = s;
                        break;
                    }
                }

                if (!targetSection) return;

                const oldIndex = targetSection.problems.findIndex(p => p._id === active.id);
                const newIndex = targetSection.problems.findIndex(p => p._id === over.id);

                if (oldIndex === -1 || newIndex === -1) return;

                // Optimistic update
                const newProblems = arrayMove(targetSection.problems, oldIndex, newIndex);
                const updatedSections = list.sections.map(s => {
                    if (s._id === targetSection._id) {
                        return { ...s, problems: newProblems };
                    }
                    return s;
                });
                setList({ ...list, sections: updatedSections });

                try {
                    await listService.reorderProblem(currentListId, targetSection._id, oldIndex, newIndex);
                } catch (err) {
                    console.error("Problem reorder failed", err);
                    const updated = await listService.getListByName(list.name);
                    setList(updated);
                }
            }
        }
    };

    // Sort Logic
    const sortedSections = useMemo(() => {
        if (!list || !list.sections) return [];
        let sections = [...list.sections];

        // Sorting problems within sections
        if (sortMode !== 'default') {
            sections = sections.map(s => {
                let problems = [...s.problems];
                if (sortMode === 'easy-hard') {
                    const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                    problems.sort((a, b) => (diffOrder[a.difficulty] || 99) - (diffOrder[b.difficulty] || 99));
                } else if (sortMode === 'hard-easy') {
                    const diffOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                    problems.sort((a, b) => (diffOrder[b.difficulty] || -1) - (diffOrder[a.difficulty] || -1));
                } else if (sortMode === 'revisions-desc') {
                    problems.sort((a, b) => (b.revision_count || 0) - (a.revision_count || 0));
                }
                return { ...s, problems };
            });
        }
        return sections;
    }, [list, sortMode]);

    const renderDragOverlay = () => {
        if (!activeItem) return null;
        // Return simplified view for drag preview
        if (activeItem.type === 'section') {
            return (
                <div className="p-4 bg-[#1e1e24] border border-violet-500/50 rounded-xl shadow-2xl w-[300px]">
                    <span className="font-bold text-white">{activeItem.title}</span>
                </div>
            );
        }
        return (
            <div className="p-3 bg-[#1e1e24] border border-violet-500/50 rounded-lg shadow-2xl w-[300px]">
                <span className="text-sm font-medium text-slate-200">{activeItem.title}</span>
            </div>
        );
    };

    if (loading && !list && allLists.length === 0) return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center text-red-400">
            {error}
        </div>
    );




    // --- DASHBOARD VIEW ---
    if (viewMode === 'dashboard') {
        return (
            <div className="min-h-screen bg-[#030014] text-white p-6 md:p-12 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-block">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                                Curated Sheets
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                Select a roadmap to start your mastery journey. From community favorites to custom lists.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allLists.map((l, idx) => (
                            <motion.div
                                key={l._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleSelectList(l.name)}
                                className="group relative bg-[#111113] border border-white/[0.06] hover:border-violet-500/20 rounded-xl p-7 cursor-pointer overflow-hidden transition-colors"
                            >


                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {l.name.includes('NeetCode') ? <Sparkles className="text-yellow-400" size={28} /> :
                                            l.name.includes('Striver') ? <Trophy className="text-orange-400" size={28} /> :
                                                <Layers className="text-violet-400" size={28} />}
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-200 transition-colors">{l.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{l.description || 'No description available.'}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-xs font-semibold text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                            OPEN SHEET
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all">
                                            <ArrowUp className="rotate-90" size={14} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Fallback Sync Button for Admin */}
                        {isAdmin && (
                            <motion.div
                                onClick={handleSeedFamousLists}
                                className="group relative bg-dashed border-2 border-white/10 hover:border-green-500/50 rounded-3xl p-8 cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:bg-green-500/5 min-h-[300px]"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {submitting ? <div className="animate-spin h-6 w-6 border-2 border-green-500 rounded-full border-t-transparent" /> : <RefreshCw className="text-green-500" size={24} />}
                                </div>
                                <h3 className="text-lg font-bold text-slate-300 group-hover:text-green-400">Sync Sheets</h3>
                                <p className="text-slate-500 text-xs mt-2">Missing something? Click to fetch NeetCode/Striver lists manually.</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST VIEW (Existing UI wrapped) ---
    // Calculate stats
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
                {/* Header with Back Button */}
                <div className="mb-10 text-center relative">
                    <button
                        onClick={handleBackToDashboard}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-2 group"
                    >
                        <ArrowUp className="-rotate-90 group-hover:-translate-x-1 transition-transform" size={18} />
                        <span className="hidden sm:inline text-sm font-medium">All Sheets</span>
                    </button>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <Sparkles size={14} className="text-yellow-300" />
                        <span className="text-xs font-semibold text-slate-200 tracking-widest uppercase">Official DSA Curriculum</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                        {list.name}
                    </h1>
                </div>

                {/* Progress Bar */}
                <div className="bg-[#111113] border border-white/[0.06] p-6 rounded-xl mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-5">
                        <div>
                            <div className="flex items-center gap-2 text-slate-300 mb-2">
                                <Trophy className="text-amber-400" size={18} />
                                <span className="font-semibold tracking-wide uppercase text-xs text-slate-400">Total Mastery</span>
                            </div>
                            <div className="text-4xl font-bold text-white tracking-tight flex items-baseline gap-2">
                                {solved}
                                <span className="text-xl text-slate-600 font-medium">/ {total} Problems</span>
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-violet-400">{progress}%</div>
                    </div>
                    <div className="h-3 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <div style={{ width: `${progress}%` }} className="h-full bg-violet-500 rounded-full transition-all duration-700" />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/10 shadow-lg">
                                <Layers size={20} className="text-violet-300" />
                            </span>
                            Modules/Patterns
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
                                                    handleIncrementRevision={handleIncrementRevision}
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
                    <DragOverlay>
                        {renderDragOverlay()}
                    </DragOverlay>
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
