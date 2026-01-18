import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical } from 'lucide-react';
import { fetchProblems } from '../services/api';
import Card from '../components/ui/Card';
import TabNavigation from '../components/ui/TabNavigation';
import FloatingButton from '../components/ui/FloatingButton';
import Checkbox from '../components/ui/Checkbox';
import theme from '../styles/theme';

const Dashboard = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('problems');

    const tabs = [
        { id: 'problems', label: 'Problems' },
        { id: 'revisions', label: 'Revisions' },
        { id: 'tasks', label: 'Tasks' }
    ];

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        try {
            setLoading(true);
            const data = await fetchProblems();
            if (data && data.problems) {
                setProblems(data.problems);
            } else {
                setProblems([]);
            }
        } catch (err) {
            console.error('Failed to load problems:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = () => {
        navigate('/problems/new');
    };

    const handleProblemClick = (problemId) => {
        navigate(`/problems/${problemId}`);
    };

    // Header styles
    const headerStyle = {
        padding: `${theme.spacing.lg} ${theme.spacing.lg} 0`,
        marginBottom: theme.spacing.md,
    };

    const titleStyle = {
        fontSize: theme.typography.fontSize.xxxl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xxl,
        letterSpacing: '-0.5px',
    };

    const searchBarStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    };

    const searchButtonStyle = {
        padding: theme.spacing.md,
        color: theme.colors.text,
    };

    const moreButtonStyle = {
        padding: theme.spacing.md,
        color: theme.colors.text,
    };

    // Content styles
    const contentStyle = {
        padding: `0 ${theme.spacing.lg}`,
        paddingBottom: '100px', // Space for FAB
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
    };

    // Problem card content
    const ProblemCardContent = ({ problem }) => {
        const cardContentStyle = {
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        };

        const titleStyle = {
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            lineHeight: theme.typography.lineHeight.tight,
        };

        const metaStyle = {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
        };

        const statusStyle = {
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
        };

        const isOverdue = problem.status === 'overdue';
        const isPending = problem.status === 'pending';

        return (
            <div style={cardContentStyle}>
                <div>
                    <div style={titleStyle}>{problem.title}</div>
                    <div style={metaStyle}>
                        {problem.topic} • {problem.difficulty}
                    </div>
                    {problem.notes && (
                        <div style={{
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.textTertiary,
                            marginTop: theme.spacing.xs,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}>
                            {problem.notes}
                        </div>
                    )}
                </div>
                <div style={statusStyle}>
                    {isOverdue && (
                        <>
                            <span style={{ color: theme.colors.overdue }}>!</span>
                            <span style={{ color: theme.colors.overdue }}>Overdue</span>
                        </>
                    )}
                    {isPending && !isOverdue && (
                        <>
                            <span>○</span>
                            <span>Pending</span>
                        </>
                    )}
                    {problem.revision_count > 0 && (
                        <span style={{ marginLeft: 'auto' }}>
                            ✓ {problem.revision_count}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: theme.colors.background,
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={titleStyle}>Notes</h1>
                    <div style={searchBarStyle}>
                        <button style={searchButtonStyle}>
                            <Search size={20} />
                        </button>
                        <button style={moreButtonStyle}>
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Content */}
            <div style={contentStyle}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: theme.spacing.xxxl,
                        color: theme.colors.textSecondary,
                    }}>
                        Loading...
                    </div>
                ) : problems.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: theme.spacing.xxxl,
                        color: theme.colors.textSecondary,
                    }}>
                        No problems yet. Create your first note!
                    </div>
                ) : (
                    <div style={gridStyle}>
                        {problems.map((problem) => (
                            <Card
                                key={problem.id}
                                onClick={() => handleProblemClick(problem.id)}
                            >
                                <ProblemCardContent problem={problem} />
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <FloatingButton
                onClick={handleCreateNote}
                label="CREATE A NOTE"
            />
        </div>
    );
};

export default Dashboard;
