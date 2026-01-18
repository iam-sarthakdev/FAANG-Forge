import React from 'react';
import theme from '../../styles/theme';

const StatusBadge = ({ status, className = '' }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'completed':
                return {
                    color: theme.colors.success,
                    text: '✓',
                    label: 'Completed'
                };
            case 'overdue':
                return {
                    color: theme.colors.overdue,
                    text: '!',
                    label: 'Overdue'
                };
            case 'pending':
                return {
                    color: theme.colors.warning,
                    text: '○',
                    label: 'Pending'
                };
            default:
                return {
                    color: theme.colors.textSecondary,
                    text: '○',
                    label: 'No Status'
                };
        }
    };

    const config = getStatusConfig();

    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing.xs,
        fontSize: theme.typography.fontSize.xs,
        color: config.color,
        fontWeight: theme.typography.fontWeight.medium,
    };

    const iconStyle = {
        fontSize: theme.typography.fontSize.sm,
    };

    return (
        <div style={badgeStyle} className={className}>
            <span style={iconStyle}>{config.text}</span>
            <span>{config.label}</span>
        </div>
    );
};

export default StatusBadge;
