import React from 'react';
import { Network } from 'lucide-react';
import RoadmapSheet from '../components/RoadmapSheet';
import { CN_SECTIONS } from '../data/cnSheetData';

const CNSheetPage = () => {
    return (
        <RoadmapSheet
            title="Computer Networks"
            subtitle="Most Asked Computer Networks Interview Questions"
            icon={Network}
            accentColor="#eab308"
            sections={CN_SECTIONS}
            storageKey="cn-sheet"
        />
    );
};

export default CNSheetPage;
