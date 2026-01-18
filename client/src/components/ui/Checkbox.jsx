import React from 'react';
import theme from '../../styles/theme';

const Checkbox = ({ checked, onChange, label }) => {
    const checkboxStyle = {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: `2px solid ${checked ? theme.colors.success : theme.colors.border}`,
        backgroundColor: checked ? theme.colors.success : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: `all ${theme.transitions.fast}`,
    };

    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        cursor: 'pointer',
    };

    const labelStyle = {
        fontSize: theme.typography.fontSize.base,
        color: checked ? theme.colors.textSecondary : theme.colors.text,
        textDecoration: checked ? 'line-through' : 'none',
        transition: `all ${theme.transitions.fast}`,
    };

    return (
        <div style={containerStyle} onClick={onChange}>
            <div style={checkboxStyle}>
                {checked && (
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2 6L5 9L10 3"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
            {label && <span style={labelStyle}>{label}</span>}
        </div>
    );
};

export default Checkbox;
