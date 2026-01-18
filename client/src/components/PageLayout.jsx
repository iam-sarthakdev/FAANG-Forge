import React from 'react';
import Navigation from '../components/Navigation';

const PageLayout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main>{children}</main>
        </div>
    );
};

export default PageLayout;
