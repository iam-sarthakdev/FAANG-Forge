// DBMS Interview Sheet — Most Asked DBMS Interview Questions
// Inspired by TakeUForward DBMS Sheet

export const DBMS_SECTIONS = [
    {
        id: 'intro-dbms',
        title: 'Introduction to DBMS',
        color: '#f59e0b',
        topics: [
            { id: 'db-1', title: 'What is DBMS and why is it needed?', type: 'video', url: 'https://www.youtube.com/watch?v=kBdlM6hNDAE' },
            { id: 'db-2', title: 'File System vs DBMS', type: 'video', url: 'https://www.youtube.com/watch?v=1TDcyyMb_sI' },
            { id: 'db-3', title: 'DBMS Architecture (1-tier, 2-tier, 3-tier)', type: 'video', url: 'https://www.youtube.com/watch?v=WbypDAzNRoY' },
            { id: 'db-4', title: 'Schema, Instance and Data Independence', type: 'video', url: 'https://www.youtube.com/watch?v=VSB-sg0tPbA' },
            { id: 'db-5', title: 'ER Model & ER Diagrams', type: 'video', url: 'https://www.youtube.com/watch?v=6MhS1MHHKrg' },
        ]
    },
    {
        id: 'data-models',
        title: 'Data Models',
        color: '#3b82f6',
        topics: [
            { id: 'dm-1', title: 'Relational Model', type: 'video', url: 'https://www.youtube.com/watch?v=JCfUMEtEH3c' },
            { id: 'dm-2', title: 'Keys in DBMS (Primary, Foreign, Candidate, Super)', type: 'video', url: 'https://www.youtube.com/watch?v=F6a2SiaDowY' },
            { id: 'dm-3', title: 'Relational Algebra', type: 'video', url: 'https://www.youtube.com/watch?v=52l3Dbxxtys' },
            { id: 'dm-4', title: 'Functional Dependencies', type: 'video', url: 'https://www.youtube.com/watch?v=DzE6QDPC_So' },
        ]
    },
    {
        id: 'rdbms',
        title: 'RDBMS',
        color: '#10b981',
        topics: [
            { id: 'rd-1', title: '1NF, 2NF, 3NF & BCNF Normalization', type: 'video', url: 'https://www.youtube.com/watch?v=J-drts33N8g' },
            { id: 'rd-2', title: 'Denormalization — When and Why?', type: 'article', url: 'https://www.youtube.com/watch?v=GF-UUG-lc1Y' },
            { id: 'rd-3', title: 'Indexing and its Types (B-Tree, Hash)', type: 'video', url: 'https://www.youtube.com/watch?v=-qNSXPIi4D4' },
            { id: 'rd-4', title: 'Views in SQL', type: 'video', url: 'https://www.youtube.com/watch?v=VQpmOmZNsVI' },
            { id: 'rd-5', title: 'Stored Procedures & Triggers', type: 'video', url: 'https://www.youtube.com/watch?v=NrBJmtD0kEw' },
            { id: 'rd-6', title: 'Cursors in SQL', type: 'article', url: 'https://www.youtube.com/watch?v=4I_VnKuRJnw' },
        ]
    },
    {
        id: 'sql-section',
        title: 'SQL',
        color: '#ef4444',
        topics: [
            { id: 'sq-1', title: 'DDL, DML, DCL, TCL Commands', type: 'video', url: 'https://www.youtube.com/watch?v=kL1MFJq0Mms' },
            { id: 'sq-2', title: 'Joins — INNER, LEFT, RIGHT, FULL, CROSS, SELF', type: 'video', url: 'https://www.youtube.com/watch?v=2HVMiPPuPIM' },
            { id: 'sq-3', title: 'Aggregate Functions & GROUP BY', type: 'video', url: 'https://www.youtube.com/watch?v=LjPsLXEftQA' },
        ]
    },
    {
        id: 'txn-concurrency',
        title: 'Transactions and Concurrency Control',
        color: '#8b5cf6',
        topics: [
            { id: 'tc-1', title: 'ACID Properties in Detail', type: 'video', url: 'https://www.youtube.com/watch?v=pomxJOFVcQs' },
            { id: 'tc-2', title: 'Concurrency Control — Lock-based Protocols', type: 'video', url: 'https://www.youtube.com/watch?v=WE1xVUjKcb4' },
            { id: 'tc-3', title: 'Deadlock in DBMS — Detection and Prevention', type: 'video', url: 'https://www.youtube.com/watch?v=WqSPy4RsQMQ' },
            { id: 'tc-4', title: 'Isolation Levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable)', type: 'video', url: 'https://www.youtube.com/watch?v=4EajrPgJAk0' },
        ]
    },
    {
        id: 'query-opt',
        title: 'Query Optimization',
        color: '#06b6d4',
        topics: [
            { id: 'qo-1', title: 'Query Processing and Optimization', type: 'video', url: 'https://www.youtube.com/watch?v=k0bYvf-axJk' },
            { id: 'qo-2', title: 'Cost-based vs Rule-based Optimization', type: 'article', url: 'https://www.youtube.com/watch?v=LjPsLXEftQA' },
            { id: 'qo-3', title: 'EXPLAIN Plans & Query Tuning', type: 'video', url: 'https://www.youtube.com/watch?v=BHwzDmr6d7s' },
        ]
    },
    {
        id: 'scalability-perf',
        title: 'Scalability and Performance Optimization',
        color: '#f97316',
        topics: [
            { id: 'sp-1', title: 'Database Partitioning and Sharding', type: 'video', url: 'https://www.youtube.com/watch?v=5faMjKuB9bc' },
            { id: 'sp-2', title: 'Database Caching Strategies', type: 'video', url: 'https://www.youtube.com/watch?v=U3RkDLtS7uY' },
        ]
    },
    {
        id: 'data-integrity',
        title: 'Data Integrity and Security',
        color: '#ec4899',
        topics: [
            { id: 'di-1', title: 'Constraints and Referential Integrity', type: 'video', url: 'https://www.youtube.com/watch?v=zt0OQb1DBko' },
            { id: 'di-2', title: 'SQL Injection and Prevention', type: 'video', url: 'https://www.youtube.com/watch?v=2OPVViV-GQk' },
        ]
    },
];
