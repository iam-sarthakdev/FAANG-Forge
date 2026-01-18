import React from 'react';
import theme from '../../styles/theme';

const Card = ({
    children,
    onClick,
    className = '',
    hover = true,
    style = {}
}) => {
    const cardStyle = {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.card,
        padding: theme.spacing.lg,
        border: `1px solid ${theme.colors.border}`,
        transition: `all ${theme.transitions.normal}`,
        cursor: onClick ? 'pointer' : 'default',
        ...style
    };

    const hoverStyle = hover ? {
        ':hover': {
            backgroundColor: theme.colors.cardHover,
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows.cardHover,
        }
    } : {};

    return (
        <div
            className={`card ${className}`}
            onClick={onClick}
            style={cardStyle}
            onMouseEnter={(e) => {
                if (hover && onClick) {
                    e.currentTarget.style.backgroundColor = theme.colors.cardHover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme.shadows.cardHover;
                }
            }}
            onMouseLeave={(e) => {
                if (hover && onClick) {
                    e.currentTarget.style.backgroundColor = theme.colors.card;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}
        >
            {children}
        </div>
    );
};

export default Card;
