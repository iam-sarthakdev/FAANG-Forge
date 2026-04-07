import React from 'react';
import { Server } from 'lucide-react';
import RoadmapSheet from '../components/RoadmapSheet';
import { SYSTEM_DESIGN_SECTIONS } from '../data/systemDesignRoadmapData';

const SystemDesignRoadmapPage = () => {
    return (
        <RoadmapSheet
            title="System Design Roadmap"
            subtitle="Complete Roadmap with Videos for SDEs"
            icon={Server}
            accentColor="#3b82f6"
            sections={SYSTEM_DESIGN_SECTIONS}
            storageKey="system-design-roadmap"
        />
    );
};

export default SystemDesignRoadmapPage;
