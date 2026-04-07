import React from 'react';
import { Database } from 'lucide-react';
import RoadmapSheet from '../components/RoadmapSheet';
import { DBMS_SECTIONS } from '../data/dbmsSheetData';

const DBMSSheetPage = () => {
    return (
        <RoadmapSheet
            title="DBMS Interview Sheet"
            subtitle="Most Asked DBMS Interview Questions"
            icon={Database}
            accentColor="#10b981"
            sections={DBMS_SECTIONS}
            storageKey="dbms-sheet"
        />
    );
};

export default DBMSSheetPage;
