import jwt from 'jsonwebtoken';

// Middleware to verify JWT token and attach user to request
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login to continue.'
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key-change-in-production'
            );

            // Attach user info to request
            req.user = {
                userId: decoded.userId
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key-change-in-production'
            );

            req.user = {
                userId: decoded.userId
            };
        } catch (jwtError) {
            req.user = null;
        }

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};
