import React from 'react';
import theme from '../../styles/theme';

const FloatingButton = ({ onClick, label = 'CREATE A NOTE', icon }) => {
    const buttonStyle = {
        position: 'fixed',
        bottom: theme.spacing.xxl,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: theme.colors.accent,
        color: theme.colors.text,
        padding: `${theme.spacing.md} ${theme.spacing.xxxl}`,
        borderRadius: theme.borderRadius.button,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: theme.shadows.button,
        transition: `all ${theme.transitions.normal}`,
        zIndex: theme.zIndex.fab,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
    };

    return (
        <button
            onClick={onClick}
            style={buttonStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.accentHover;
                e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.accent;
                e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
            }}
        >
            {icon && <span>{icon}</span>}
            {label}
        </button>
    );
};

export default FloatingButton;
