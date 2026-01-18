import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Edit, Trash2 } from 'lucide-react';
import { fetchProblemById, markAsRevised, deleteProblem } from '../services/api';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import LoadingSpinner from '../components/LoadingSpinner';

const ProblemDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProblem();
    }, [id]);

    const loadProblem = async () => {
        try {
            const data = await fetchProblemById(id);
            setProblem(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleMarkRevised = async () => {
        const nextDate = prompt('Enter next reminder date (YYYY-MM-DD):');
        if (!nextDate) return;

        try {
            await markAsRevised(id, {
                notes: 'Revised',
                next_reminder_date: nextDate
            });
            loadProblem();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this problem?')) return;
        try {
            await deleteProblem(id);
            navigate('/problems');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!problem) return <div className="text-center mt-8">Problem not found</div>;

    const DifficultyBadge = ({ difficulty }) => {
        const classes = {
            Easy: 'badge-easy',
            Medium: 'badge-medium',
            Hard: 'badge-hard'
        };
        return <span className={classes[difficulty]}>{difficulty}</span>;
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Back Button */}
            <Link to="/problems" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6">
                <ArrowLeft className="w-5 h-5" />
                Back to Problems
            </Link>

            {/* Problem Header */}
            <div className="glass-card p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold flex-1">{problem.title}</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={handleMarkRevised} className="btn-primary">
                            Mark as Revised
                        </button>
                        <button onClick={handleDelete} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="badge-topic">{problem.topic}</span>
                    <DifficultyBadge difficulty={problem.difficulty} />
                </div>

                {problem.url && (
                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-4"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open Problem Link
                    </a>
                )}

                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white/60">
                        <Calendar className="w-5 h-5" />
                        <span>Next Reminder: {formatDate(problem.next_reminder_date)}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {problem.notes && (
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-xl font-bold mb-3">Notes</h2>
                    <p className="text-white/80 whitespace-pre-wrap">{problem.notes}</p>
                </div>
            )}

            {/* Revision History */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold mb-4">Revision History</h2>
                {problem.revisions.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No revisions yet</p>
                ) : (
                    <div className="space-y-4">
                        {problem.revisions.map((revision) => (
                            <div key={revision.id} className="flex items-start gap-4 bg-white/5 p-4 rounded-lg">
                                <div className="bg-primary/20 p-2 rounded-lg">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">{formatDate(revision.revised_at)}</div>
                                    <div className="text-sm text-white/60">{getRelativeTime(revision.revised_at)}</div>
                                    {revision.notes && (
                                        <p className="text-white/80 mt-2">{revision.notes}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemDetailPage;
