// OS Interview Sheet — Most Asked Operating System Interview Questions
// Inspired by TakeUForward OS Sheet

export const OS_SECTIONS = [
    {
        id: 'intro-os',
        title: 'Introduction to OS',
        color: '#8b5cf6',
        topics: [
            { id: 'os-1', title: 'What is an Operating System?', type: 'video', url: 'https://www.youtube.com/watch?v=bkSWJJZNgf8' },
            { id: 'os-2', title: 'Types of OS (Batch, Time-Sharing, Real-Time, Distributed)', type: 'video', url: 'https://www.youtube.com/watch?v=-e_rK7M3OYg' },
            { id: 'os-3', title: 'System Calls', type: 'video', url: 'https://www.youtube.com/watch?v=lhToWeuWWfw' },
            { id: 'os-4', title: 'User Mode vs Kernel Mode', type: 'video', url: 'https://www.youtube.com/watch?v=JCfUMEtEH3c' },
            { id: 'os-5', title: 'Multithreading & Multitasking', type: 'video', url: 'https://www.youtube.com/watch?v=7ENFeb-J75k' },
            { id: 'os-6', title: 'Process vs Thread', type: 'video', url: 'https://www.youtube.com/watch?v=4rLW7zg21gI' },
            { id: 'os-7', title: 'Interrupt Handling and Context Switching', type: 'video', url: 'https://www.youtube.com/watch?v=DKmBLsB-kMU' },
        ]
    },
    {
        id: 'process-mgmt',
        title: 'Process Management',
        color: '#f59e0b',
        topics: [
            { id: 'pm-1', title: 'Process Lifecycle (New, Ready, Running, Waiting, Terminated)', type: 'video', url: 'https://www.youtube.com/watch?v=jZ_6PXoaoxo' },
            { id: 'pm-2', title: 'CPU Scheduling Algorithms (FCFS, SJF, Priority, Round Robin)', type: 'video', url: 'https://www.youtube.com/watch?v=uFfMKoV7Yf8' },
            { id: 'pm-3', title: 'Process Synchronization & Critical Section Problem', type: 'video', url: 'https://www.youtube.com/watch?v=ph2awKa8r5Y' },
            { id: 'pm-4', title: 'Deadlocks — Detection, Prevention & Avoidance (Banker\'s Algorithm)', type: 'video', url: 'https://www.youtube.com/watch?v=UVo9GFYRDkI' },
            { id: 'pm-5', title: 'Semaphores, Mutex, Monitors', type: 'video', url: 'https://www.youtube.com/watch?v=8wcjWZt0Nno' },
        ]
    },
    {
        id: 'memory-mgmt',
        title: 'Memory Management',
        color: '#3b82f6',
        topics: [
            { id: 'mm-1', title: 'Memory Management Basics (Contiguous, Non-Contiguous)', type: 'video', url: 'https://www.youtube.com/watch?v=dz9Tk6KCMlQ' },
            { id: 'mm-2', title: 'Paging', type: 'video', url: 'https://www.youtube.com/watch?v=LKYKp_ZzlvM' },
            { id: 'mm-3', title: 'Segmentation', type: 'video', url: 'https://www.youtube.com/watch?v=dz9Tk6KCMlQ' },
            { id: 'mm-4', title: 'Virtual Memory', type: 'video', url: 'https://www.youtube.com/watch?v=qlH4-oHnBb8' },
            { id: 'mm-5', title: 'Page Replacement Algorithms (FIFO, LRU, Optimal)', type: 'video', url: 'https://www.youtube.com/watch?v=16kaPQtYo28' },
            { id: 'mm-6', title: 'Thrashing', type: 'video', url: 'https://www.youtube.com/watch?v=FLOzPJuBwNQ' },
            { id: 'mm-7', title: 'Memory Fragmentation (Internal, External)', type: 'article', url: 'https://www.youtube.com/watch?v=dz9Tk6KCMlQ' },
            { id: 'mm-8', title: 'Translation Lookaside Buffer (TLB)', type: 'video', url: 'https://www.youtube.com/watch?v=95QpHJX55hI' },
        ]
    },
    {
        id: 'file-systems',
        title: 'File Systems',
        color: '#10b981',
        topics: [
            { id: 'fs-1', title: 'File System Structure and Organization', type: 'video', url: 'https://www.youtube.com/watch?v=RrfN-HYEVbY' },
            { id: 'fs-2', title: 'File Allocation Methods (Contiguous, Linked, Indexed)', type: 'video', url: 'https://www.youtube.com/watch?v=RrfN-HYEVbY' },
            { id: 'fs-3', title: 'Directory Structures', type: 'article', url: 'https://www.youtube.com/watch?v=2Dh7KSBY8bg' },
            { id: 'fs-4', title: 'Disk Scheduling Algorithms (FCFS, SSTF, SCAN, C-SCAN)', type: 'video', url: 'https://www.youtube.com/watch?v=MXKnC1TfUbU' },
        ]
    },
    {
        id: 'io-systems',
        title: 'I/O Systems',
        color: '#ef4444',
        topics: [
            { id: 'io-1', title: 'I/O Hardware and Software', type: 'video', url: 'https://www.youtube.com/watch?v=F18RiREDkwE' },
            { id: 'io-2', title: 'Synchronous vs Asynchronous I/O', type: 'article', url: 'https://www.youtube.com/watch?v=wB9tIg209-8' },
            { id: 'io-3', title: 'DMA (Direct Memory Access)', type: 'video', url: 'https://www.youtube.com/watch?v=fgWU9YCUkuE' },
        ]
    },
    {
        id: 'storage-protection',
        title: 'Storage Management and Data Protection',
        color: '#f97316',
        topics: [
            { id: 'st-1', title: 'RAID Levels and Data Redundancy', type: 'video', url: 'https://www.youtube.com/watch?v=U-OCdTeZLac' },
        ]
    },
];
