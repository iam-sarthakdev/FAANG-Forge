// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Database error
    if (err.code && err.code.startsWith('23')) {
        return res.status(400).json({
            error: 'Database constraint violation',
            details: err.detail || err.message
        });
    }

    // Validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: err.message
        });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
};
