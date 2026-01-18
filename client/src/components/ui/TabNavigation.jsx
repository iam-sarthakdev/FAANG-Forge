import React from 'react';
import theme from '../../styles/theme';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
    const containerStyle = {
        display: 'flex',
        gap: theme.spacing.sm,
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        backgroundColor: 'transparent',
    };

    const tabStyle = (isActive) => ({
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        borderRadius: theme.borderRadius.button,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        backgroundColor: isActive ? theme.colors.text : 'transparent',
        color: isActive ? theme.colors.background : theme.colors.text,
        transition: `all ${theme.transitions.fast}`,
        cursor: 'pointer',
        border: 'none',
        whiteSpace: 'nowrap',
    });

    return (
        <div style={containerStyle}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={tabStyle(activeTab === tab.id)}
                    onMouseEnter={(e) => {
                        if (activeTab !== tab.id) {
                            e.currentTarget.style.backgroundColor = theme.colors.card;
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeTab !== tab.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;
