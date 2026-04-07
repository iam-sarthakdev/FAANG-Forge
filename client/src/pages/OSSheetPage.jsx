import React from 'react';
import { Cpu } from 'lucide-react';
import RoadmapSheet from '../components/RoadmapSheet';
import { OS_SECTIONS } from '../data/osSheetData';

const OSSheetPage = () => {
    return (
        <RoadmapSheet
            title="OS Interview Sheet"
            subtitle="Most Asked Operating System Questions"
            icon={Cpu}
            accentColor="#8b5cf6"
            sections={OS_SECTIONS}
            storageKey="os-sheet"
        />
    );
};

export default OSSheetPage;
