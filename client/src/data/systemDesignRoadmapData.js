// System Design Roadmap — Comprehensive topic list with video/article links
// Inspired by TakeUForward / Striver's System Design Sheet

export const SYSTEM_DESIGN_SECTIONS = [
    {
        id: 'basics',
        title: 'Basics',
        color: '#f59e0b',
        topics: [
            { id: 'sd-1', title: 'What is System Design?', type: 'video', url: 'https://www.youtube.com/watch?v=FSR1s2b-l_I' },
            { id: 'sd-2', title: 'Horizontal vs Vertical Scaling', type: 'video', url: 'https://www.youtube.com/watch?v=xpDnVSmNFX0' },
            { id: 'sd-3', title: 'Capacity Estimation', type: 'article', url: 'https://www.youtube.com/watch?v=0163cssUxLA' },
            { id: 'sd-4', title: 'HTTP & HTTPS', type: 'video', url: 'https://www.youtube.com/watch?v=hExRDVZHhig' },
            { id: 'sd-5', title: 'TCP/IP Model', type: 'article', url: 'https://www.youtube.com/watch?v=F27PLin3TV0' },
            { id: 'sd-6', title: 'How DNS Works', type: 'video', url: 'https://www.youtube.com/watch?v=27r4Bzuj5NQ' },
            { id: 'sd-7', title: 'Client-Server Architecture', type: 'article', url: 'https://www.youtube.com/watch?v=L5BlpPU_muY' },
            { id: 'sd-8', title: 'Proxy vs Reverse Proxy', type: 'video', url: 'https://www.youtube.com/watch?v=4NB0NDtOwIQ' },
            { id: 'sd-9', title: 'Latency vs Throughput', type: 'article', url: 'https://www.youtube.com/watch?v=wKTHk7qahIM' },
            { id: 'sd-10', title: 'What is an API?', type: 'video', url: 'https://www.youtube.com/watch?v=s7wmiS2mSXY' },
            { id: 'sd-11', title: 'REST vs GraphQL', type: 'video', url: 'https://www.youtube.com/watch?v=yWzKJPw_VzM' },
            { id: 'sd-12', title: 'WebSockets', type: 'video', url: 'https://www.youtube.com/watch?v=1BfCnjr_Vjg' },
        ]
    },
    {
        id: 'load-balancing',
        title: 'Load Balancing',
        color: '#3b82f6',
        topics: [
            { id: 'lb-1', title: 'What is Load Balancing?', type: 'video', url: 'https://www.youtube.com/watch?v=K0Ta65OqQkY' },
            { id: 'lb-2', title: 'Consistent Hashing', type: 'video', url: 'https://www.youtube.com/watch?v=UF9Iqmg94tk' },
            { id: 'lb-3', title: 'Load Balancing Algorithms', type: 'article', url: 'https://www.youtube.com/watch?v=dBmxNsS3BGE' },
        ]
    },
    {
        id: 'datastores',
        title: 'DataStores',
        color: '#10b981',
        topics: [
            { id: 'ds-1', title: 'SQL vs NoSQL Databases', type: 'video', url: 'https://www.youtube.com/watch?v=Q2Z_e7sxB0g' },
            { id: 'ds-2', title: 'Database Indexing', type: 'video', url: 'https://www.youtube.com/watch?v=-qNSXPIi4D4' },
            { id: 'ds-3', title: 'Database Sharding', type: 'video', url: 'https://www.youtube.com/watch?v=5faMjKuB9bc' },
            { id: 'ds-4', title: 'Database Replication', type: 'video', url: 'https://www.youtube.com/watch?v=bI8Ry6GhMSE' },
            { id: 'ds-5', title: 'ACID Properties', type: 'article', url: 'https://www.youtube.com/watch?v=pomxJOFVcQs' },
        ]
    },
    {
        id: 'consistency-availability',
        title: 'Consistency vs. Availability',
        color: '#ef4444',
        topics: [
            { id: 'ca-1', title: 'CAP Theorem', type: 'video', url: 'https://www.youtube.com/watch?v=_RbsFXWRZ10' },
            { id: 'ca-2', title: 'Eventual Consistency', type: 'article', url: 'https://www.youtube.com/watch?v=rpqsEXJBi_g' },
            { id: 'ca-3', title: 'Strong vs Eventual Consistency', type: 'video', url: 'https://www.youtube.com/watch?v=VaFpoDmBGNM' },
        ]
    },
    {
        id: 'message-queues',
        title: 'Message Queues',
        color: '#8b5cf6',
        topics: [
            { id: 'mq-1', title: 'What are Message Queues?', type: 'video', url: 'https://www.youtube.com/watch?v=5-Rq4-PZlew' },
            { id: 'mq-2', title: 'Kafka Architecture', type: 'video', url: 'https://www.youtube.com/watch?v=uvb00oaa3k8' },
            { id: 'mq-3', title: 'RabbitMQ vs Kafka', type: 'article', url: 'https://www.youtube.com/watch?v=w21SVbGsU_g' },
        ]
    },
    {
        id: 'devops-concepts',
        title: 'DevOps Concepts',
        color: '#06b6d4',
        topics: [
            { id: 'do-1', title: 'CI/CD Pipelines', type: 'video', url: 'https://www.youtube.com/watch?v=scEDHsr3APg' },
            { id: 'do-2', title: 'Docker & Containers', type: 'video', url: 'https://www.youtube.com/watch?v=rOTqprHv1YE' },
            { id: 'do-3', title: 'Kubernetes Basics', type: 'video', url: 'https://www.youtube.com/watch?v=VnvRFRk_51k' },
            { id: 'do-4', title: 'Monitoring & Logging', type: 'article', url: 'https://www.youtube.com/watch?v=5lkNH0RYkRk' },
            { id: 'do-5', title: 'Infrastructure as Code', type: 'article', url: 'https://www.youtube.com/watch?v=POPP2WTJ8es' },
            { id: 'do-6', title: 'Blue-Green Deployments', type: 'video', url: 'https://www.youtube.com/watch?v=OKM0ICSQ0Jk' },
        ]
    },
    {
        id: 'caching',
        title: 'Caching',
        color: '#f97316',
        topics: [
            { id: 'ch-1', title: 'What is Caching?', type: 'video', url: 'https://www.youtube.com/watch?v=U3RkDLtS7uY' },
            { id: 'ch-2', title: 'Cache Eviction Policies (LRU, LFU)', type: 'video', url: 'https://www.youtube.com/watch?v=mMqoGNiS4aQ' },
            { id: 'ch-3', title: 'Redis Deep Dive', type: 'video', url: 'https://www.youtube.com/watch?v=jgpVdJB2sKQ' },
            { id: 'ch-4', title: 'CDN (Content Delivery Network)', type: 'video', url: 'https://www.youtube.com/watch?v=RI9np1LWzqw' },
        ]
    },
    {
        id: 'microservices',
        title: 'Microservices',
        color: '#ec4899',
        topics: [
            { id: 'ms-1', title: 'Monolith vs Microservices', type: 'video', url: 'https://www.youtube.com/watch?v=qYhRvH9tJKw' },
            { id: 'ms-2', title: 'Service Discovery', type: 'article', url: 'https://www.youtube.com/watch?v=GboiMJm6WlA' },
        ]
    },
    {
        id: 'api-gateways',
        title: 'API Gateways',
        color: '#14b8a6',
        topics: [
            { id: 'ag-1', title: 'API Gateway Pattern', type: 'video', url: 'https://www.youtube.com/watch?v=6ULyxuHKxg8' },
            { id: 'ag-2', title: 'Rate Limiting', type: 'video', url: 'https://www.youtube.com/watch?v=FjQ_jCPLm1k' },
        ]
    },
    {
        id: 'auth-mechanisms',
        title: 'Authentication Mechanisms',
        color: '#a855f7',
        topics: [
            { id: 'au-1', title: 'OAuth 2.0', type: 'video', url: 'https://www.youtube.com/watch?v=ZV5yTm4pT8g' },
            { id: 'au-2', title: 'JWT (JSON Web Tokens)', type: 'video', url: 'https://www.youtube.com/watch?v=7Q17ubqLfaM' },
            { id: 'au-3', title: 'Session vs Token Authentication', type: 'article', url: 'https://www.youtube.com/watch?v=7Q17ubqLfaM' },
        ]
    },
    {
        id: 'sd-tradeoffs',
        title: 'System Design Tradeoffs',
        color: '#eab308',
        topics: [
            { id: 'tr-1', title: 'Latency vs Consistency', type: 'article', url: 'https://www.youtube.com/watch?v=REB_eGHK_P4' },
            { id: 'tr-2', title: 'SQL vs NoSQL — When to Use What', type: 'video', url: 'https://www.youtube.com/watch?v=Q2Z_e7sxB0g' },
            { id: 'tr-3', title: 'Pull vs Push Architecture', type: 'video', url: 'https://www.youtube.com/watch?v=J8sBd3qCWaU' },
            { id: 'tr-4', title: 'Long Polling vs WebSockets vs SSE', type: 'video', url: 'https://www.youtube.com/watch?v=ZBM28ZPlin8' },
            { id: 'tr-5', title: 'Synchronous vs Asynchronous Processing', type: 'article', url: 'https://www.youtube.com/watch?v=BoAbRVJPveo' },
            { id: 'tr-6', title: 'Batch Processing vs Stream Processing', type: 'video', url: 'https://www.youtube.com/watch?v=A3Mvy8WMk04' },
        ]
    },
    {
        id: 'practice-problems',
        title: 'Practice Problems',
        color: '#22c55e',
        topics: [
            { id: 'pp-1', title: 'Design a URL Shortener (TinyURL)', type: 'video', url: 'https://www.youtube.com/watch?v=fMZMm_0ZhK4' },
            { id: 'pp-2', title: 'Design Instagram', type: 'video', url: 'https://www.youtube.com/watch?v=VJpfO6KdyWE' },
            { id: 'pp-3', title: 'Design Twitter', type: 'video', url: 'https://www.youtube.com/watch?v=wYk0xPP_P_8' },
            { id: 'pp-4', title: 'Design WhatsApp / Chat System', type: 'video', url: 'https://www.youtube.com/watch?v=vvhC64hQZMk' },
            { id: 'pp-5', title: 'Design YouTube / Netflix', type: 'video', url: 'https://www.youtube.com/watch?v=jPKTo1iGQiE' },
            { id: 'pp-6', title: 'Design Uber / Lyft', type: 'video', url: 'https://www.youtube.com/watch?v=umWABit_NoQ' },
            { id: 'pp-7', title: 'Design Dropbox / Google Drive', type: 'video', url: 'https://www.youtube.com/watch?v=U0xTu6E2CT8' },
            { id: 'pp-8', title: 'Design a Rate Limiter', type: 'video', url: 'https://www.youtube.com/watch?v=FjQ_jCPLm1k' },
            { id: 'pp-9', title: 'Design a Web Crawler', type: 'video', url: 'https://www.youtube.com/watch?v=BKZxZwUgL3Y' },
            { id: 'pp-10', title: 'Design a Notification System', type: 'video', url: 'https://www.youtube.com/watch?v=bBTPZ9NdSk8' },
            { id: 'pp-11', title: 'Design Google Maps', type: 'video', url: 'https://www.youtube.com/watch?v=jk3yvVfNvds' },
            { id: 'pp-12', title: 'Design Airline Reservation System', type: 'video', url: 'https://www.youtube.com/watch?v=5W9YJdvN3DI' },
            { id: 'pp-13', title: 'Design Amazon / E-commerce', type: 'video', url: 'https://www.youtube.com/watch?v=EpASu_1dUdE' },
            { id: 'pp-14', title: 'Design Reddit', type: 'video', url: 'https://www.youtube.com/watch?v=KYExYE_9nIY' },
            { id: 'pp-15', title: 'Design an Online Judge (LeetCode)', type: 'video', url: 'https://www.youtube.com/watch?v=S2mYycIJdi8' },
            { id: 'pp-16', title: 'Design Pastebin', type: 'video', url: 'https://www.youtube.com/watch?v=josjRSBqEBI' },
            { id: 'pp-17', title: 'Design Stock Exchange', type: 'video', url: 'https://www.youtube.com/watch?v=dUMWMZmMsVE' },
        ]
    },
    {
        id: 'additional-resources',
        title: 'Additional Resources',
        color: '#64748b',
        topics: [
            { id: 'ar-1', title: 'System Design Primer (GitHub)', type: 'article', url: 'https://github.com/donnemartin/system-design-primer' },
            { id: 'ar-2', title: 'Grokking System Design (Free Notes)', type: 'article', url: 'https://www.designgurus.io/course/grokking-the-system-design-interview' },
            { id: 'ar-3', title: 'ByteByteGo Newsletter', type: 'article', url: 'https://blog.bytebytego.com/' },
        ]
    },
];
