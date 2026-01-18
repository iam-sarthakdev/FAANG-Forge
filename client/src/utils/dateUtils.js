// Format date to YYYY-MM-DD
export const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

// Format date to readable string
export const formatDate = (date) => {
    if (!date) return 'No reminder set';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Calculate days ago
export const daysAgo = (date) => {
    const today = new Date();
    const past = new Date(date);
    const diffTime = today - past;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Get days until date
export const daysUntil = (date) => {
    const today = new Date();
    const future = new Date(date);
    const diffTime = future - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Get relative time string
export const getRelativeTime = (date) => {
    const days = daysAgo(date);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
};
