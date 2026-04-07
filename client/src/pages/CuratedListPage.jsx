import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, CheckCircle, Circle,
    ExternalLink, Plus, Trophy, Layers, Trash2, Github, Globe, Sparkles,
    Lock, ArrowUp, ArrowDown, RefreshCw, ArrowUpDown, GripVertical,
    Code2, Tag, X, Save, Building2, Crown, Search, Star, Zap, Filter,
    Database, Server, Cpu, Network, Lightbulb, AlertTriangle
} from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
import { MASTERLISTS } from '../data/masterlistData';
import { DSA_PATTERNS } from '../data/dsaPatternsData';

// --- Sortable Item Components ---

const SortableSectionItem = React.memo(({ section, idx, isExpanded, toggleSection, openDeleteModal, isAdmin, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section._id, disabled: !isAdmin });

    const [showPattern, setShowPattern] = useState(false);
    const patternData = DSA_PATTERNS[section.title]; // Array of patterns for this section

    const [editingPattern, setEditingPattern] = useState(null); // stores pattern.title
    const [editCode, setEditCode] = useState("");
    const [customSkeletons, setCustomSkeletons] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('faang-forge-dsa-skeletons')) || {};
        } catch { return {}; }
    });

    const handleSaveSkeleton = (patternTitle) => {
        const key = `${section.title}-${patternTitle}`;
        const updated = { ...customSkeletons, [key]: editCode };
        setCustomSkeletons(updated);
        try { localStorage.setItem('faang-forge-dsa-skeletons', JSON.stringify(updated)); } catch {}
        setEditingPattern(null);
    };

    // Use transform to only apply drag translation without altering the base layout performance
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 99 : 'auto',
        position: 'relative' // Fix z-index stacking during drag
    };

    // Section stats
    const totalProblems = section.problems.length;
    const solvedCount = section.problems.filter(p => p.isCompleted).length;
    const totalRevisions = section.problems.reduce((acc, p) => acc + (p.revision_count || 0), 0);
    const completionPct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;
    const isPerfect = completionPct === 100;

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div
                className={`group/section bg-[#09090b] border ${isExpanded ? 'border-white/[0.08]' : 'border-white/[0.04]'} hover:border-white/[0.08] rounded-[14px] overflow-hidden transition-colors duration-300 mb-4`}
            >
                <div 
                    className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] transition-colors"
                    onClick={() => toggleSection(section._id)}
                >
                    <div className="flex items-center gap-4 flex-1">
                        {isAdmin && (
                            <div {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1 -ml-2 transition-colors">
                                <GripVertical size={16} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0 flex items-center flex-wrap gap-x-4 gap-y-2">
                            <h3 className={`text-[15px] font-medium tracking-tight transition-colors ${isPerfect ? 'text-emerald-400' : isExpanded ? 'text-white' : 'text-slate-300 group-hover/section:text-white'} truncate`}>
                                {section.title}
                            </h3>
                            
                            {/* Progress info inline */}
                            <div className="flex items-center gap-3">
                                <span className={`text-[11px] font-medium tracking-wide ${isPerfect ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                                    {solvedCount} / {totalProblems} <span className="hidden sm:inline">completed</span>
                                </span>
                                {totalRevisions > 0 && (
                                    <span className="text-[11px] font-medium bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                                        {totalRevisions} revs
                                    </span>
                                )}
                            </div>
                            
                            {/* Seamless unified progress bar integrated into the flow */}
                            <div className="w-full lg:max-w-[200px] h-1 bg-white/[0.04] rounded-full overflow-hidden mt-0.5 lg:ml-auto lg:mt-0 flex-shrink-0">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${isPerfect ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
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
                            className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-white' : 'group-hover/section:text-slate-300'}`}
                        >
                            <ChevronDown size={18} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Extremely fast pure CSS accordion, no framer-motion lag */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] border-t border-white/[0.04]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        {patternData && patternData.length > 0 && (
                            <div className="px-5 py-3 bg-[#0a0a0c] border-b border-white/[0.03]">
                                <button
                                    onClick={() => setShowPattern(!showPattern)}
                                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                    <Code2 size={14} />
                                    {showPattern ? 'Hide' : 'Show'} Pattern Skeletons
                                </button>

                                {showPattern && (
                                    <div className="mt-4 space-y-5 pb-2">
                                        {patternData.map((pattern, pIdx) => (
                                            <div key={pIdx} className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
                                                {/* Header */}
                                                <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border" style={{ background: pattern.colorBg, borderColor: pattern.colorBorder }}>
                                                        {pattern.emoji}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-white">{pattern.title}</h4>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">{pattern.description}</p>
                                                    </div>
                                                </div>

                                                <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {/* Code Block */}
                                                    <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-[#0a0a0c] lg:col-span-1">
                                                        <div className="flex items-center justify-between px-3 py-2 bg-[#0e0e10] border-b border-white/[0.04]">
                                                            <div className="flex gap-1.5">
                                                                <div className="w-2 h-2 rounded-full bg-red-400/80" />
                                                                <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
                                                                <div className="w-2 h-2 rounded-full bg-green-400/80" />
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-mono text-slate-600 uppercase">Java</span>
                                                                {isAdmin && (
                                                                    editingPattern === pattern.title ? (
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => setEditingPattern(null)} className="text-[10px] text-slate-400 hover:text-white transition-colors">Cancel</button>
                                                                            <button onClick={() => handleSaveSkeleton(pattern.title)} className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors">Save</button>
                                                                        </div>
                                                                    ) : (
                                                                        <button onClick={() => { setEditingPattern(pattern.title); setEditCode(customSkeletons[`${section.title}-${pattern.title}`] || pattern.code); }} className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">Edit</button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="max-h-[300px] overflow-auto custom-scrollbar bg-[#161618]">
                                                            {editingPattern === pattern.title ? (
                                                                <Editor
                                                                    value={editCode}
                                                                    onValueChange={code => setEditCode(code)}
                                                                    highlight={code => Prism.highlight(code, Prism.languages.java, 'java')}
                                                                    padding={12}
                                                                    style={{
                                                                        fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                                                                        fontSize: 12,
                                                                        backgroundColor: 'transparent',
                                                                        color: '#e2e8f0',
                                                                        minHeight: '100px'
                                                                    }}
                                                                    className="editor-container"
                                                                />
                                                            ) : (
                                                                <SyntaxHighlighter
                                                                    language="java"
                                                                    style={vscDarkPlus}
                                                                    customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '12px' }}
                                                                    wrapLines={true}
                                                                >
                                                                    {customSkeletons[`${section.title}-${pattern.title}`] || pattern.code}
                                                                </SyntaxHighlighter>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Strategy Notes */}
                                                    <div className="space-y-3 lg:col-span-1 flex flex-col justify-start">
                                                        <div className="p-3 bg-blue-500/[0.03] border border-blue-500/10 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-1.5 text-blue-400">
                                                                <Search size={14} />
                                                                <span className="text-xs font-bold uppercase tracking-wider">How to Identify</span>
                                                            </div>
                                                            <p className="text-xs text-blue-100/70 leading-relaxed">{pattern.howToIdentify}</p>
                                                        </div>

                                                        <div className="p-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-1.5 text-amber-500">
                                                                <Trophy size={14} />
                                                                <span className="text-xs font-bold uppercase tracking-wider">Killer Problems</span>
                                                            </div>
                                                            <p className="text-xs text-amber-100/70 leading-relaxed">{pattern.killerProblems}</p>
                                                        </div>

                                                        <div className="p-3 bg-red-500/[0.03] border border-red-500/10 rounded-lg max-h-max">
                                                            <div className="flex items-center gap-2 mb-1.5 text-red-500">
                                                                <AlertTriangle size={14} />
                                                                <span className="text-xs font-bold uppercase tracking-wider">Common Mistakes</span>
                                                            </div>
                                                            <p className="text-xs text-red-100/70 leading-relaxed">{pattern.commonMistakes}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="py-2">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.section === nextProps.section && 
           prevProps.isExpanded === nextProps.isExpanded && 
           prevProps.isAdmin === nextProps.isAdmin &&
           prevProps.children === nextProps.children; 
});

const SortableProblemItem = React.memo(({ problem, sectionId, idx, openDeleteModal, handleToggleCompletion, handleIncrementRevision, isAdmin, onOpenCompanyTags, onToggleCodeDrawer, codeDrawerOpen }) => {
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
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
        zIndex: isDragging ? 99 : 'auto'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <div
                className={`group/problem flex items-center justify-between px-5 py-2.5 transition-colors duration-200 border-b border-white/[0.02] last:border-b-0 ${problem.isCompleted
                    ? 'opacity-60 bg-transparent'
                    : 'bg-transparent hover:bg-white/[0.02]'
                    }`}
            >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {isAdmin && (
                        <div {...listeners} className="cursor-grab active:cursor-grabbing text-slate-700 hover:text-slate-500 -ml-2 transition-colors">
                            <GripVertical size={16} />
                        </div>
                    )}

                    {/* Minimalist Checkmark */}
                    <button
                        onClick={(e) => handleToggleCompletion(sectionId, problem._id, e)}
                        className={`flex-shrink-0 transition-transform hover:scale-110 active:scale-95 ${problem.isCompleted ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                        {problem.isCompleted
                            ? <CheckCircle size={20} />
                            : <Circle size={20} strokeWidth={1.5} />
                        }
                    </button>
                    
                    <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4">
                        <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[14px] truncate block transition-colors flex-1 ${problem.isCompleted ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-300 font-medium hover:text-white'}`}
                        >
                            {problem.title}
                        </a>
                        
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Aesthetic Soft Difficulty Pills */}
                            <span className={`text-[11px] font-medium px-2.5 py-[2px] rounded-full tracking-wide flex-shrink-0 ${String(problem.difficulty) === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                String(problem.difficulty) === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                                    String(problem.difficulty) === 'Hard' ? 'bg-rose-500/10 text-rose-400' :
                                        'bg-white/5 text-slate-400'
                                }`}>
                                {String(problem.difficulty || 'N/A')}
                            </span>
                            
                            {/* Platform Pill */}
                            <span className="hidden sm:flex text-[11px] font-medium px-2 py-[2px] rounded-full bg-white/[0.03] text-slate-400 items-center gap-1.5 flex-shrink-0 border border-white/[0.04]">
                                {String(problem.platform) === 'LeetCode' ? <Globe size={10} /> : <Github size={10} />}
                                {String(problem.platform || '')}
                            </span>
                            
                            {/* Revision Count pill */}
                            {(problem.revision_count > 0 || problem.problemRef?.revision_count > 0) ? (
                                <div className="flex items-center gap-1 px-2 py-[2px] rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-medium flex-shrink-0">
                                    <RefreshCw size={10} />
                                    <span>{problem.revision_count || problem.problemRef?.revision_count || 0}</span>
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => handleIncrementRevision(sectionId, problem._id, e)}
                                            className="ml-1 p-0.5 rounded-full hover:bg-indigo-500/20 text-indigo-400 transition-colors opacity-0 group-hover/problem:opacity-100"
                                        >
                                            <Plus size={10} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                isAdmin && (
                                    <button
                                        onClick={(e) => handleIncrementRevision(sectionId, problem._id, e)}
                                        className="text-[11px] font-medium px-1 py-0.5 rounded-full text-slate-600 hover:bg-white/[0.03] hover:text-indigo-400 transition-all opacity-0 group-hover/problem:opacity-100 flex items-center"
                                        title="Mark as Revised"
                                    >
                                        <RefreshCw size={10} className="mr-1" />
                                        <Plus size={8} strokeWidth={3} />
                                    </button>
                                )
                            )}

                            {/* Minimal Company Tags */}
                            <div className="hidden lg:flex items-center gap-1.5">
                                {Array.isArray(problem.companyTags) && problem.companyTags.length > 0 && problem.companyTags.map((tag, i) => (
                                    <span key={i} className="text-[10px] font-medium tracking-wide px-1.5 py-0.5 rounded bg-cyan-500/5 text-cyan-400 border border-cyan-500/10">
                                        {String(tag)}
                                    </span>
                                ))}

                                {isAdmin && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onOpenCompanyTags(sectionId, problem._id, problem.companyTags || []); }}
                                        className="text-[10px] px-1 py-0.5 rounded text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors opacity-0 group-hover/problem:opacity-100"
                                    >
                                        + Tag
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hover Actions Block */}
                <div className="flex items-center gap-1 ml-4 transition-opacity opacity-0 group-hover/problem:opacity-100">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleCodeDrawer(sectionId, problem._id); }}
                        className={`p-1.5 rounded-md transition-colors ${codeDrawerOpen
                            ? 'text-violet-400 bg-violet-500/10'
                            : problem.code ? 'text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/15' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
                            }`}
                        title={problem.code ? 'View/Edit Code' : 'Add Code'}
                    >
                        <Code2 size={16} strokeWidth={1.5} />
                    </button>
                    
                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] rounded-md transition-colors"
                        title="Solve Problem"
                    >
                        <ExternalLink size={16} strokeWidth={1.5} />
                    </a>
                    
                    {isAdmin && (
                        <button
                            onClick={(e) => { e.stopPropagation(); openDeleteModal('problem', sectionId, problem._id); }}
                            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors ml-1"
                        >
                            <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.problem === nextProps.problem && 
           prevProps.codeDrawerOpen === nextProps.codeDrawerOpen &&
           prevProps.isAdmin === nextProps.isAdmin;
});


const CuratedListsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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

    // Company Tags Modal
    const [companyTagsModal, setCompanyTagsModal] = useState({ open: false, sectionId: null, problemId: null, tags: [] });
    const [newTagInput, setNewTagInput] = useState('');

    // Code Drawer
    const [codeDrawer, setCodeDrawer] = useState({ sectionId: null, problemId: null });
    const [codeInput, setCodeInput] = useState('');
    const [codeLang, setCodeLang] = useState('cpp');
    const [codeSaving, setCodeSaving] = useState(false);

    // Featured Masterlists
    const [activeMasterlist, setActiveMasterlist] = useState(null);
    const [masterlistSearch, setMasterlistSearch] = useState('');
    const [masterlistDiffFilter, setMasterlistDiffFilter] = useState('All');

    // Guard ref to prevent auto-seed from running multiple times
    const seedAttempted = useRef(false);

    useEffect(() => {
        fetchAllLists();
    }, []);

    // --- Auto-Seed Logic for Admin (runs only once) ---
    useEffect(() => {
        if (isAdmin && !loading && !seedAttempted.current) {
            const hasNeetCode = allLists.some(l => l.name.includes('NeetCode'));
            if (!hasNeetCode && allLists.length > 0) {
                seedAttempted.current = true;
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
    }, [isAdmin, loading]);

    const fetchAllLists = async () => {
        try {
            setError(null);
            const data = await listService.getLists();
            setAllLists(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching lists:", err);
            setError("Could not load lists. The server may be starting up — please try again.");
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

    const toggleSection = useCallback((id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

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

    const openDeleteModal = useCallback((type, sectionId, problemId = null) => {
        setDeleteModal({ open: true, type, sectionId, problemId });
        setDeletePassword('');
        setVerifyError('');
    }, []);

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

    const handleToggleCompletion = useCallback(async (sectionId, problemId, e) => {
        e.stopPropagation();
        
        let problemStatusChangedTo = false;

        setList(prev => {
            const updatedList = { ...prev };
            updatedList.sections = updatedList.sections.map(s => {
                if (s._id === sectionId) {
                    return {
                        ...s,
                        problems: s.problems.map(p => {
                            if (p._id === problemId) {
                                problemStatusChangedTo = !p.isCompleted;
                                return { ...p, isCompleted: !p.isCompleted };
                            }
                            return p;
                        })
                    };
                }
                return s;
            });
            return updatedList;
        });

        try {
            await listService.toggleProblemCompletion(currentListId, sectionId, problemId);
        } catch (err) {
            console.error(err);
            // On error we would technically revert the UI. For now, failure logs only.
        }
    }, [currentListId]);

    const handleIncrementRevision = useCallback(async (sectionId, problemId, e) => {
        e.stopPropagation();
        setList(prev => {
            const updatedList = { ...prev };
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
            return updatedList;
        });

        try {
            await listService.incrementRevision(currentListId, sectionId, problemId);
        } catch (err) {
            console.error(err);
        }
    }, [currentListId]);

    // --- Company Tags Handlers ---
    const onOpenCompanyTags = useCallback((sectionId, problemId, existingTags) => {
        setCompanyTagsModal({ open: true, sectionId, problemId, tags: [...(existingTags || [])] });
        setNewTagInput('');
    }, []);

    const handleAddTag = () => {
        const tag = newTagInput.trim();
        if (!tag || companyTagsModal.tags.includes(tag)) return;
        setCompanyTagsModal(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        setNewTagInput('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setCompanyTagsModal(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    const handleSaveCompanyTags = async () => {
        if (!currentListId || !companyTagsModal.sectionId || !companyTagsModal.problemId) return;
        setSubmitting(true);
        try {
            await listService.updateCompanyTags(currentListId, companyTagsModal.sectionId, companyTagsModal.problemId, companyTagsModal.tags);
            // Optimistic update
            setList(prev => ({
                ...prev,
                sections: prev.sections.map(s => {
                    if (s._id === companyTagsModal.sectionId) {
                        return {
                            ...s,
                            problems: s.problems.map(p => {
                                if (p._id === companyTagsModal.problemId) return { ...p, companyTags: companyTagsModal.tags };
                                return p;
                            })
                        };
                    }
                    return s;
                })
            }));
            setCompanyTagsModal({ open: false, sectionId: null, problemId: null, tags: [] });
        } catch (err) {
            console.error(err);
            alert('Failed to update company tags');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Code Drawer Handlers ---
    const onToggleCodeDrawer = useCallback((sectionId, problemId) => {
        setCodeDrawer(prev => {
            if (prev.sectionId === sectionId && prev.problemId === problemId) {
                return { sectionId: null, problemId: null };
            }
            return { sectionId, problemId };
        });

        // Set code input values based on the newly opened problem
        setList(currentList => {
            if (currentList && currentList.sections) {
                const section = currentList.sections.find(s => s._id === sectionId);
                const problem = section?.problems.find(p => p._id === problemId);
                setCodeInput(problem?.code || '');
                setCodeLang(problem?.language || 'cpp');
            }
            return currentList; 
        });
    }, []);

    const handleSaveCode = async () => {
        if (!currentListId || !codeDrawer.sectionId || !codeDrawer.problemId) return;
        setCodeSaving(true);
        try {
            await listService.saveCode(currentListId, codeDrawer.sectionId, codeDrawer.problemId, codeInput, codeLang);
            // Optimistic update
            setList(prev => ({
                ...prev,
                sections: prev.sections.map(s => {
                    if (s._id === codeDrawer.sectionId) {
                        return {
                            ...s,
                            problems: s.problems.map(p => {
                                if (p._id === codeDrawer.problemId) return { ...p, code: codeInput, language: codeLang };
                                return p;
                            })
                        };
                    }
                    return s;
                })
            }));
        } catch (err) {
            console.error(err);
            alert('Failed to save code');
        } finally {
            setCodeSaving(false);
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

    // Difficulty breakdown stats (must be before any early returns to obey Rules of Hooks)
    const diffStats = useMemo(() => {
        const stats = { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } };
        if (!list?.sections) return stats;
        list.sections.forEach(s => s.problems.forEach(p => {
            const d = p.difficulty;
            if (stats[d]) {
                stats[d].total++;
                if (p.isCompleted) stats[d].solved++;
            }
        }));
        return stats;
    }, [list]);

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
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
            <p className="text-slate-500 text-sm mt-2">Loading your lists...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
                onClick={() => { setLoading(true); setError(null); fetchAllLists(); }}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
                Retry
            </button>
        </div>
    );




    // --- DASHBOARD VIEW ---
    if (viewMode === 'dashboard') {
        return (
            <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative">
                {/* Vercel inspired subtle ambient glow */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[150px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/5 rounded-full blur-[150px]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16 mt-8">
                        <div className="inline-block relative">
                            {/* Subtle top glare */}
                            <div className="absolute -inset-x-6 -top-6 h-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl pointer-events-none" />
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 tracking-tight">
                                Curated Sheets
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                                Select a roadmap to start your mastery journey. From community favorites to premium custom lists.
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 flex items-center gap-3 px-2">
                        <Sparkles className="text-yellow-500/80" size={20} />
                        <h2 className="text-xl font-bold text-slate-200 tracking-tight">DSA Lists</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                        {allLists.map((l, idx) => (
                            <motion.div
                                key={l._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleSelectList(l.name)}
                                className="group relative bg-[#09090b] border border-white/[0.04] hover:border-white/[0.12] rounded-2xl p-7 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-15px_rgba(139,92,246,0.1)]"
                            >
                                {/* Linear-inspired top highlight line */}
                                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center mb-6 shadow-Inner transform group-hover:-translate-y-1 transition-transform duration-300">
                                        {l.name.includes('NeetCode') ? <Sparkles className="text-yellow-400" size={24} /> :
                                            l.name.includes('Striver') ? <Trophy className="text-orange-400" size={24} /> :
                                                <Layers className="text-violet-400" size={24} />}
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white tracking-tight transition-colors">{l.name === "Sarthak's List" ? "Sarthak's Masterlist" : l.name}</h3>
                                    <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed">{l.description || 'No description available.'}</p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-[11px] font-bold text-slate-500 group-hover:text-violet-300 tracking-wider transition-colors uppercase">
                                            Open Sheet &rarr;
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Fallback Sync Button for Admin */}
                        {isAdmin && (
                            <motion.div
                                onClick={handleSeedFamousLists}
                                className="group relative bg-transparent border border-dashed border-white/10 hover:border-white/20 rounded-2xl p-8 cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:bg-white/[0.02]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {submitting ? <div className="animate-spin h-5 w-5 border-2 border-white/50 rounded-full border-t-transparent" /> : <RefreshCw className="text-slate-400 group-hover:text-white" size={20} />}
                                </div>
                                <h3 className="text-[15px] font-semibold text-slate-400 group-hover:text-slate-200">Sync Sheets</h3>
                                <p className="text-slate-500 text-xs mt-2 max-w-[200px]">Missing standard lists? Click to fetch them manually.</p>
                            </motion.div>
                        )}
                    </div>
                    
                    <div className="mb-6 flex items-center gap-3 px-2">
                        <Trophy className="text-fuchsia-500/80" size={20} />
                        <h2 className="text-xl font-bold text-slate-200 tracking-tight">Interview Prep Sheets</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { name: 'SQL Master', desc: '10+ Patterns & Problems', icon: <Database className="text-cyan-400" size={24} />, route: '/sql-master', color: 'cyan', gradient: 'from-cyan-500/20 to-transparent' },
                            { name: 'System Design', desc: 'Complete Video Roadmap', icon: <Server className="text-blue-400" size={24} />, route: '/sd-roadmap', color: 'blue', gradient: 'from-blue-500/20 to-transparent' },
                            { name: 'DBMS Sheet', desc: 'Top Interview Topics', icon: <Database className="text-emerald-400" size={24} />, route: '/dbms-sheet', color: 'emerald', gradient: 'from-emerald-500/20 to-transparent' },
                            { name: 'OS Sheet', desc: 'Core Operating Systems', icon: <Cpu className="text-purple-400" size={24} />, route: '/os-sheet', color: 'purple', gradient: 'from-purple-500/20 to-transparent' },
                            { name: 'CN Sheet', desc: 'Computer Networks', icon: <Network className="text-amber-400" size={24} />, route: '/cn-sheet', color: 'amber', gradient: 'from-amber-500/20 to-transparent' }
                        ].map((card, idx) => (
                            <motion.div
                                key={card.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (allLists.length + idx) * 0.05 }}
                                onClick={() => navigate(card.route)}
                                className="group relative bg-[#09090b] border border-white/[0.04] hover:border-white/[0.12] rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300"
                            >
                                <div className={`absolute top-0 inset-x-0 h-[100px] bg-gradient-to-b ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-Inner transform group-hover:-translate-y-1 transition-transform duration-300">
                                        {card.icon}
                                    </div>
                                    <h3 className="text-[17px] font-bold text-slate-100 mb-1 tracking-tight group-hover:text-white transition-colors">{card.name}</h3>
                                    <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">{card.desc}</p>
                                    
                                    <div className="text-[11px] font-bold text-slate-500 group-hover:text-white tracking-wider transition-colors uppercase mt-auto">
                                        Start Prep &rarr;
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header with Back Button */}
                <div className="mb-12 relative">
                    <button
                        onClick={handleBackToDashboard}
                        className="py-2 px-3 -ml-3 mb-4 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-all flex items-center gap-2 group w-max"
                    >
                        <ArrowUp className="-rotate-90 group-hover:-translate-x-1 transition-transform" size={16} />
                        <span className="text-[13px] font-medium tracking-wide">Back to Dashboard</span>
                    </button>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] mb-4">
                        <Sparkles size={12} className="text-violet-400" />
                        <span className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">Official Curriculum</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        {list.name === "Sarthak's List" ? "Sarthak's Masterlist" : list.name}
                    </h1>
                </div>

                {/* Progress Header Card */}
                <div className="bg-[#09090b] border border-white/[0.04] p-8 rounded-3xl mb-12 relative overflow-hidden shadow-2xl shadow-violet-500/5">
                    {/* Inner aesthetic elements */}
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Trophy className="text-violet-400" size={16} />
                                <span className="font-bold tracking-widest uppercase text-[11px] text-slate-400">Total Mastery</span>
                            </div>
                            <div className="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-baseline gap-2">
                                {solved}
                                <span className="text-xl md:text-2xl text-slate-600 font-medium tracking-normal">/ {total} <span className="hidden sm:inline">Problems</span></span>
                            </div>
                        </div>
                        <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-fuchsia-600 mt-4 md:mt-0 tracking-tighter">
                            {progress}%
                        </div>
                    </div>
                    
                    {/* Main Progress Bar */}
                    <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden mb-8 shadow-inner">
                        <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-1000 ease-out relative">
                            {/* Shiny progress tip */}
                            <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30" />
                        </div>
                    </div>

                    {/* Difficulty Breakdown (Linear-esque tags) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Easy */}
                        <div className="bg-transparent border border-white/[0.04] rounded-2xl p-5 hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Easy</span>
                                <span className="text-[13px] font-bold text-slate-300">{diffStats.Easy.solved} <span className="text-slate-600">/ {diffStats.Easy.total}</span></span>
                            </div>
                            <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                <div style={{ width: diffStats.Easy.total > 0 ? `${(diffStats.Easy.solved / diffStats.Easy.total) * 100}%` : '0%' }} className="h-full bg-emerald-500 rounded-full transition-all duration-700" />
                            </div>
                        </div>
                        {/* Medium */}
                        <div className="bg-transparent border border-white/[0.04] rounded-2xl p-5 hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Medium</span>
                                <span className="text-[13px] font-bold text-slate-300">{diffStats.Medium.solved} <span className="text-slate-600">/ {diffStats.Medium.total}</span></span>
                            </div>
                            <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                <div style={{ width: diffStats.Medium.total > 0 ? `${(diffStats.Medium.solved / diffStats.Medium.total) * 100}%` : '0%' }} className="h-full bg-amber-500 rounded-full transition-all duration-700" />
                            </div>
                        </div>
                        {/* Hard */}
                        <div className="bg-transparent border border-white/[0.04] rounded-2xl p-5 hover:bg-white/[0.01] transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Hard</span>
                                <span className="text-[13px] font-bold text-slate-300">{diffStats.Hard.solved} <span className="text-slate-600">/ {diffStats.Hard.total}</span></span>
                            </div>
                            <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                <div style={{ width: diffStats.Hard.total > 0 ? `${(diffStats.Hard.solved / diffStats.Hard.total) * 100}%` : '0%' }} className="h-full bg-rose-500 rounded-full transition-all duration-700" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    🏆 FEATURED MASTERLISTS — Premium curated interview lists
                    Only shown when viewing Sarthak's Masterlist
                   ═══════════════════════════════════════════════════════════════ */}
                {(list?.name === "Sarthak's Masterlist" || list?.name === "Sarthak's List") && (
                    <div className="mb-12">
                        {/* Section Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                                <Crown size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Featured Masterlists</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Hand-curated interview-ready problem collections</p>
                            </div>
                        </div>

                        {/* Masterlist Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {MASTERLISTS.map((ml, idx) => {
                                const easyCount = ml.problems.filter(p => p.difficulty === 'Easy').length;
                                const medCount = ml.problems.filter(p => p.difficulty === 'Medium').length;
                                const hardCount = ml.problems.filter(p => p.difficulty === 'Hard').length;

                                return (
                                    <motion.div
                                        key={ml.id}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.12, type: 'spring', stiffness: 120 }}
                                        onClick={() => { setActiveMasterlist(ml); setMasterlistSearch(''); setMasterlistDiffFilter('All'); }}
                                        className="group relative cursor-pointer rounded-2xl overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(145deg, rgba(17,17,19,0.95), rgba(17,17,19,0.7))',
                                        }}
                                    >
                                        {/* Gradient border effect */}
                                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            style={{
                                                background: `linear-gradient(135deg, ${ml.accentFrom}22, transparent 50%, ${ml.accentTo}22)`,
                                            }}
                                        />
                                        <div className="absolute inset-[1px] rounded-2xl"
                                            style={{ background: 'linear-gradient(145deg, rgba(17,17,19,0.97), rgba(17,17,19,0.85))' }}
                                        />

                                        {/* Glow effect on hover */}
                                        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                                            style={{ background: ml.accentGlow }}
                                        />

                                        <div className="relative z-10 p-6">
                                            {/* Icon + Badge */}
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border border-white/[0.06] shadow-lg"
                                                    style={{ background: `linear-gradient(135deg, ${ml.accentFrom}15, ${ml.accentTo}15)` }}
                                                >
                                                    {ml.icon}
                                                </div>
                                                <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                                    style={{
                                                        color: ml.accentFrom,
                                                        borderColor: `${ml.accentFrom}30`,
                                                        background: `${ml.accentFrom}08`
                                                    }}
                                                >
                                                    {ml.problems.length} Problems
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
                                                style={{ '--tw-gradient-from': ml.accentFrom, '--tw-gradient-to': ml.accentTo }}
                                            >
                                                <span className="group-hover:hidden">{ml.name}</span>
                                                <span className="hidden group-hover:inline bg-gradient-to-r bg-clip-text text-transparent"
                                                    style={{ backgroundImage: `linear-gradient(to right, ${ml.accentFrom}, ${ml.accentTo})` }}
                                                >{ml.name}</span>
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-5 leading-relaxed">{ml.subtitle}</p>

                                            {/* Difficulty Breakdown Mini Bar */}
                                            <div className="flex items-center gap-1.5 mb-4">
                                                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.04] flex">
                                                    <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${(easyCount / ml.problems.length) * 100}%` }} />
                                                    <div className="h-full bg-yellow-500 transition-all duration-700" style={{ width: `${(medCount / ml.problems.length) * 100}%` }} />
                                                    <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${(hardCount / ml.problems.length) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* Difficulty Tags */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/15">
                                                    {easyCount} Easy
                                                </span>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/15">
                                                    {medCount} Med
                                                </span>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/15">
                                                    {hardCount} Hard
                                                </span>
                                                <div className="ml-auto">
                                                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                        <ExternalLink size={12} className="text-slate-500 group-hover:text-white transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    📋 MASTERLIST DETAIL MODAL — Full problem table overlay
                   ═══════════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {activeMasterlist && (
                        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto">
                            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setActiveMasterlist(null)} />
                            <motion.div
                                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 40, scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                className="relative z-10 w-full max-w-4xl mx-4 my-8 rounded-3xl overflow-hidden border border-white/[0.06]"
                                style={{ background: 'linear-gradient(180deg, #111113 0%, #0a0a0c 100%)' }}
                            >
                                {/* Modal Header */}
                                <div className="relative px-8 pt-8 pb-6">
                                    {/* Gradient accent line */}
                                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                                        style={{ background: `linear-gradient(to right, ${activeMasterlist.accentFrom}, ${activeMasterlist.accentTo})` }}
                                    />

                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border border-white/[0.08] shadow-xl"
                                                style={{ background: `linear-gradient(135deg, ${activeMasterlist.accentFrom}18, ${activeMasterlist.accentTo}18)` }}
                                            >
                                                {activeMasterlist.icon}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold text-transparent bg-clip-text"
                                                    style={{ backgroundImage: `linear-gradient(to right, ${activeMasterlist.accentFrom}, ${activeMasterlist.accentTo})` }}
                                                >
                                                    {activeMasterlist.name}
                                                </h2>
                                                <p className="text-sm text-slate-400 mt-1">{activeMasterlist.subtitle}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveMasterlist(null)}
                                            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-4 mt-5">
                                        {(() => {
                                            const easy = activeMasterlist.problems.filter(p => p.difficulty === 'Easy').length;
                                            const med = activeMasterlist.problems.filter(p => p.difficulty === 'Medium').length;
                                            const hard = activeMasterlist.problems.filter(p => p.difficulty === 'Hard').length;
                                            return (
                                                <>
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                                        <span className="text-xs text-slate-400 font-medium">{activeMasterlist.problems.length} total</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/[0.06] border border-green-500/15">
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        <span className="text-xs text-green-400 font-semibold">{easy} Easy</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/[0.06] border border-yellow-500/15">
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                        <span className="text-xs text-yellow-400 font-semibold">{med} Medium</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/[0.06] border border-red-500/15">
                                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                                        <span className="text-xs text-red-400 font-semibold">{hard} Hard</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Search + Filter Bar */}
                                    <div className="flex items-center gap-3 mt-5">
                                        <div className="flex-1 relative">
                                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                value={masterlistSearch}
                                                onChange={(e) => setMasterlistSearch(e.target.value)}
                                                placeholder="Search problems..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 focus:border-white/15 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => setMasterlistDiffFilter(d)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${masterlistDiffFilter === d
                                                        ? d === 'Easy' ? 'bg-green-500/20 text-green-400'
                                                            : d === 'Medium' ? 'bg-yellow-500/20 text-yellow-400'
                                                                : d === 'Hard' ? 'bg-red-500/20 text-red-400'
                                                                    : 'bg-white/10 text-white'
                                                        : 'text-slate-500 hover:text-slate-300'
                                                        }`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Problem Table */}
                                <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                                    <div className="space-y-1">
                                        {/* Table Header */}
                                        <div className="flex items-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 border-b border-white/[0.04]">
                                            <span className="w-10 text-center">#</span>
                                            <span className="flex-1 ml-3">Problem</span>
                                            <span className="w-20 text-center">Difficulty</span>
                                            <span className="w-24 text-center">Platform</span>
                                            <span className="w-12 text-center">Link</span>
                                        </div>

                                        {activeMasterlist.problems
                                            .filter(p => {
                                                const matchSearch = p.title.toLowerCase().includes(masterlistSearch.toLowerCase());
                                                const matchDiff = masterlistDiffFilter === 'All' || p.difficulty === masterlistDiffFilter;
                                                return matchSearch && matchDiff;
                                            })
                                            .map((problem, idx) => (
                                                <motion.div
                                                    key={`${activeMasterlist.id}-${idx}`}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: Math.min(idx * 0.015, 0.5) }}
                                                    className="group/row flex items-center px-4 py-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                                                >
                                                    {/* Number */}
                                                    <span className="w-10 text-center text-xs font-mono text-slate-600 group-hover/row:text-slate-400 transition-colors">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </span>

                                                    {/* Problem Name */}
                                                    <a
                                                        href={problem.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 ml-3 text-sm font-medium text-slate-200 hover:text-white group-hover/row:text-white transition-colors truncate"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {problem.title}
                                                    </a>

                                                    {/* Difficulty Badge */}
                                                    <div className="w-20 flex justify-center">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                                                            problem.difficulty === 'Easy'
                                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                                : problem.difficulty === 'Medium'
                                                                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                            {problem.difficulty}
                                                        </span>
                                                    </div>

                                                    {/* Platform */}
                                                    <div className="w-24 flex justify-center">
                                                        <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-white/[0.03] text-slate-400 border border-white/[0.06] flex items-center gap-1.5">
                                                            {problem.platform === 'LeetCode' ? <Globe size={10} /> : <Globe size={10} />}
                                                            {problem.platform}
                                                        </span>
                                                    </div>

                                                    {/* Link */}
                                                    <div className="w-12 flex justify-center">
                                                        <a
                                                            href={problem.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-colors"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    </div>
                                                </motion.div>
                                            ))
                                        }

                                        {/* Empty State */}
                                        {activeMasterlist.problems.filter(p => {
                                            const matchSearch = p.title.toLowerCase().includes(masterlistSearch.toLowerCase());
                                            const matchDiff = masterlistDiffFilter === 'All' || p.difficulty === masterlistDiffFilter;
                                            return matchSearch && matchDiff;
                                        }).length === 0 && (
                                            <div className="text-center py-12 text-slate-600">
                                                <Search size={32} className="mx-auto mb-3 opacity-40" />
                                                <p className="text-sm font-medium">No problems match your search</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

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
                                                <React.Fragment key={problem._id}>
                                                    <SortableProblemItem
                                                        problem={problem}
                                                        sectionId={section._id}
                                                        idx={pIdx}
                                                        openDeleteModal={openDeleteModal}
                                                        handleToggleCompletion={handleToggleCompletion}
                                                        handleIncrementRevision={handleIncrementRevision}
                                                        isAdmin={isAdmin}
                                                        onOpenCompanyTags={onOpenCompanyTags}
                                                        onToggleCodeDrawer={onToggleCodeDrawer}
                                                        codeDrawerOpen={codeDrawer.sectionId === section._id && codeDrawer.problemId === problem._id}
                                                    />
                                                    {/* Code Drawer */}
                                                    <AnimatePresence>
                                                        {codeDrawer.sectionId === section._id && codeDrawer.problemId === problem._id && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="ml-10 mt-2 mb-3 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xl shadow-black/30 overflow-hidden">
                                                                    {/* Header Bar */}
                                                                    <div className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-white/[0.06]">
                                                                        <div className="flex items-center gap-2.5">
                                                                            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                                                                                <Code2 size={14} className="text-violet-400" />
                                                                            </div>
                                                                            <span className="text-sm font-semibold text-slate-200 tracking-wide">Solution Code</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={handleSaveCode}
                                                                            disabled={codeSaving}
                                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20 hover:shadow-green-500/30"
                                                                        >
                                                                            <Save size={13} />
                                                                            {codeSaving ? 'Saving...' : 'Save Code'}
                                                                        </button>
                                                                    </div>

                                                                    {/* Language Tabs */}
                                                                    <div className="flex items-center gap-1 px-5 py-2.5 bg-[#0d1117] border-b border-white/[0.04]">
                                                                        {[
                                                                            { value: 'cpp', label: 'C++', icon: '⚡' },
                                                                            { value: 'java', label: 'Java', icon: '☕' },
                                                                            { value: 'python', label: 'Python', icon: '🐍' },
                                                                            { value: 'javascript', label: 'JavaScript', icon: '🟨' }
                                                                        ].map(lang => (
                                                                            <button
                                                                                key={lang.value}
                                                                                onClick={() => setCodeLang(lang.value)}
                                                                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${codeLang === lang.value
                                                                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm shadow-violet-500/10'
                                                                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
                                                                                    }`}
                                                                            >
                                                                                <span className="text-[10px]">{lang.icon}</span>
                                                                                {lang.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>

                                                                    {/* Code Editor Area with Syntax Highlighting */}
                                                                    <div className="relative" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                                                        <Editor
                                                                            value={codeInput}
                                                                            onValueChange={code => setCodeInput(code)}
                                                                            highlight={code => {
                                                                                const langMap = { cpp: 'cpp', java: 'java', python: 'python', javascript: 'javascript' };
                                                                                const grammar = Prism.languages[langMap[codeLang] || 'javascript'];
                                                                                if (!grammar) return code;
                                                                                return Prism.highlight(code, grammar, langMap[codeLang] || 'javascript');
                                                                            }}
                                                                            padding={20}
                                                                            placeholder={'// Paste your solution code here...\n// Syntax highlighting is automatic.'}
                                                                            className="code-editor-area"
                                                                            style={{
                                                                                fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", "SF Mono", Consolas, monospace',
                                                                                fontSize: '13px',
                                                                                lineHeight: '1.7',
                                                                                minHeight: '500px',
                                                                                background: '#0d1117',
                                                                                color: '#e6edf3',
                                                                                caretColor: '#58a6ff',
                                                                                overflow: 'auto',
                                                                            }}
                                                                            textareaClassName="code-editor-textarea"
                                                                        />
                                                                    </div>

                                                                    {/* Footer Status */}
                                                                    <div className="flex items-center justify-between px-5 py-2 bg-[#161b22] border-t border-white/[0.06] text-[10px] text-slate-600">
                                                                        <span>{codeInput.split('\n').length} lines</span>
                                                                        <span>{codeLang === 'cpp' ? 'C++' : codeLang === 'java' ? 'Java' : codeLang === 'python' ? 'Python' : 'JavaScript'}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </React.Fragment>
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

            {/* Company Tags Modal */}
            <AnimatePresence>
                {companyTagsModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setCompanyTagsModal({ open: false, sectionId: null, problemId: null, tags: [] })} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121214] border border-white/10 w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <Building2 size={22} className="text-cyan-400" />
                                Company Tags
                            </h3>
                            <p className="text-sm text-slate-400 mb-6">Add companies that ask this problem</p>

                            {/* Current Tags */}
                            <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                                {companyTagsModal.tags.length === 0 && (
                                    <span className="text-slate-600 text-sm italic">No company tags yet</span>
                                )}
                                {companyTagsModal.tags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-medium">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Add Tag Input */}
                            <div className="flex gap-2 mb-8">
                                <input
                                    value={newTagInput}
                                    onChange={(e) => setNewTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                                    placeholder="e.g. Google, Amazon, Meta..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors"
                                    autoFocus
                                />
                                <button onClick={handleAddTag} className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors">
                                    Add
                                </button>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setCompanyTagsModal({ open: false, sectionId: null, problemId: null, tags: [] })} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                                <button onClick={handleSaveCompanyTags} disabled={submitting} className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all">{submitting ? 'Saving...' : 'Save Tags'}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CuratedListsPage;
