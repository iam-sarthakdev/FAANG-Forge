// Modern Dark Theme Design System
export const theme = {
    colors: {
        // Background colors
        background: '#000000',
        card: '#1C1C1E',
        cardHover: '#2C2C2E',
        cardActive: '#3A3A3C',

        // Text colors
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        textTertiary: '#636366',

        // Accent colors
        accent: '#FF3B30',
        accentHover: '#FF453A',
        success: '#34C759',
        warning: '#FF9500',

        // Status colors
        overdue: '#FF3B30',
        pending: '#FF9500',
        completed: '#34C759',

        // Border colors
        border: '#38383A',
        borderLight: '#48484A',
    },

    borderRadius: {
        small: '8px',
        medium: '12px',
        card: '16px',
        large: '20px',
        button: '24px',
        full: '9999px',
    },

    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px',
    },

    typography: {
        // Font families
        fontFamily: {
            system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },

        // Font sizes
        fontSize: {
            xs: '11px',
            sm: '13px',
            base: '15px',
            lg: '17px',
            xl: '20px',
            xxl: '28px',
            xxxl: '34px',
        },

        // Font weights
        fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },

        // Line heights
        lineHeight: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.7,
        },
    },

    shadows: {
        card: '0 2px 8px rgba(0, 0, 0, 0.3)',
        cardHover: '0 4px 12px rgba(0, 0, 0, 0.4)',
        button: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },

    transitions: {
        fast: '150ms ease',
        normal: '250ms ease',
        slow: '350ms ease',
    },

    zIndex: {
        base: 1,
        dropdown: 10,
        sticky: 100,
        modal: 1000,
        fab: 1100,
    },
};

export default theme;
