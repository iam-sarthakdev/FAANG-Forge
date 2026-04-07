// CN Interview Sheet — Most Asked Computer Networks Interview Questions
// Inspired by TakeUForward CN Sheet

export const CN_SECTIONS = [
    {
        id: 'intro-cn',
        title: 'Introduction to CN',
        color: '#f59e0b',
        topics: [
            { id: 'cn-1', title: 'What is a Network?', type: 'video', url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8' },
            { id: 'cn-2', title: 'Types of Network (LAN, MAN, WAN)', type: 'article', url: 'https://www.youtube.com/watch?v=-e_rK7M3OYg' },
            { id: 'cn-3', title: 'Hubs, Switches, and Routers', type: 'video', url: 'https://www.youtube.com/watch?v=1z0ULvgBiDU' },
            { id: 'cn-4', title: 'Network Topology and their Types', type: 'video', url: 'https://www.youtube.com/watch?v=zbqrNg4C98U' },
            { id: 'cn-5', title: 'Server and Client', type: 'article', url: 'https://www.youtube.com/watch?v=L5BlpPU_muY' },
        ]
    },
    {
        id: 'osi-model',
        title: 'OSI model',
        color: '#3b82f6',
        topics: [
            { id: 'osi-1', title: 'OSI Model Layers', type: 'video', url: 'https://www.youtube.com/watch?v=vv4y_uOneC0' },
            { id: 'osi-2', title: 'Layers of OSI model in detail', type: 'video', url: 'https://www.youtube.com/watch?v=qXJBzZ2Z7Jk' },
        ]
    },
    {
        id: 'tcp-ip',
        title: 'TCP/IP model',
        color: '#10b981',
        topics: [
            { id: 'tcp-1', title: 'TCP/IP vs OSI model', type: 'video', url: 'https://www.youtube.com/watch?v=F27PLin3TV0' },
            { id: 'tcp-2', title: 'Difference between OSI and TCP/IP', type: 'article', url: 'https://www.youtube.com/watch?v=0163cssUxLA' },
        ]
    },
    {
        id: 'physical-layer',
        title: 'Physical Layer',
        color: '#ef4444',
        topics: [
            { id: 'phys-1', title: 'What is Physical Layer?', type: 'article', url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8' },
            { id: 'phys-2', title: 'Data Transmission', type: 'video', url: 'https://www.youtube.com/watch?v=hExRDVZHhig' },
            { id: 'phys-3', title: 'Bandwidth', type: 'article', url: 'https://www.youtube.com/watch?v=wKTHk7qahIM' },
            { id: 'phys-4', title: 'Baseband vs Broadband vs Multiplexing', type: 'video', url: 'https://www.youtube.com/watch?v=K0Ta65OqQkY' },
        ]
    },
    {
        id: 'data-link',
        title: 'Data Link Layer',
        color: '#8b5cf6',
        topics: [
            { id: 'dl-1', title: 'What is Data Link Layer and its functions', type: 'video', url: 'https://www.youtube.com/watch?v=5-Rq4-PZlew' },
            { id: 'dl-2', title: 'Error Detection and Error Correction', type: 'video', url: 'https://www.youtube.com/watch?v=rOTqprHv1YE' },
            { id: 'dl-3', title: 'Error Detection Protocols', type: 'video', url: 'https://www.youtube.com/watch?v=pomxJOFVcQs' },
            { id: 'dl-4', title: 'Multiple Access Protocols', type: 'article', url: 'https://www.youtube.com/watch?v=DzE6QDPC_So' },
            { id: 'dl-5', title: 'MAC Address', type: 'video', url: 'https://www.youtube.com/watch?v=5faMjKuB9bc' },
            { id: 'dl-6', title: 'Ethernet (MAC Address vs IP Address)', type: 'video', url: 'https://www.youtube.com/watch?v=1z0ULvgBiDU' },
            { id: 'dl-7', title: 'Data Link Layer Switching', type: 'article', url: 'https://www.youtube.com/watch?v=kL1MFJq0Mms' },
            { id: 'dl-8', title: 'Broadcast vs Collision Domain', type: 'video', url: 'https://www.youtube.com/watch?v=2HVMiPPuPIM' },
        ]
    },
    {
        id: 'network-layer',
        title: 'Network Layer',
        color: '#06b6d4',
        topics: [
            { id: 'nl-1', title: 'Routing vs Forwarding', type: 'article', url: 'https://www.youtube.com/watch?v=k0bYvf-axJk' },
            { id: 'nl-2', title: 'IPv4 vs IPv6', type: 'video', url: 'https://www.youtube.com/watch?v=2r5e24Jm4kI' },
            { id: 'nl-3', title: 'IPv4 Classes', type: 'video', url: 'https://www.youtube.com/watch?v=Xz2Z8D9mBf8' },
            { id: 'nl-4', title: 'Subnetting and Supernetting', type: 'video', url: 'https://www.youtube.com/watch?v=s_Ntt6eTn94' },
            { id: 'nl-5', title: 'What is IP Address? (Static, Dynamic, Public, Private)', type: 'video', url: 'https://www.youtube.com/watch?v=FTUV0t6JaDA' },
            { id: 'nl-6', title: 'ICMP (Internet Control Message Protocol)', type: 'article', url: 'https://www.youtube.com/watch?v=RrfN-HYEVbY' },
            { id: 'nl-7', title: 'NAT (Network Address Translation)', type: 'video', url: 'https://www.youtube.com/watch?v=QBqPDqLWKnc' },
            { id: 'nl-8', title: 'Default Gateway', type: 'video', url: 'https://www.youtube.com/watch?v=zbqrNg4C98U' },
        ]
    },
    {
        id: 'transport-layer',
        title: 'Transport Layer',
        color: '#f97316',
        topics: [
            { id: 'tl-1', title: 'What is Transport Layer?', type: 'video', url: 'https://www.youtube.com/watch?v=7ENFeb-J75k' },
            { id: 'tl-2', title: 'TCP vs UDP', type: 'video', url: 'https://www.youtube.com/watch?v=uZQjwlA5v6c' },
            { id: 'tl-3', title: 'TCP Connection Establishment (3-Way Handshake)', type: 'video', url: 'https://www.youtube.com/watch?v=bBTPZ9NdSk8' },
            { id: 'tl-4', title: 'TCP Congestion Control', type: 'video', url: 'https://www.youtube.com/watch?v=MXKnC1TfUbU' },
            { id: 'tl-5', title: 'Multiplexing and Demultiplexing', type: 'article', url: 'https://www.youtube.com/watch?v=7ENFeb-J75k' },
            { id: 'tl-6', title: 'Port Numbers and Sockets', type: 'video', url: 'https://www.youtube.com/watch?v=ZBM28ZPlin8' },
        ]
    },
    {
        id: 'session-layer',
        title: 'Session Layer',
        color: '#ec4899',
        topics: [
            { id: 'sl-1', title: 'Basic Introduction to Session Layer', type: 'article', url: 'https://www.youtube.com/watch?v=vv4y_uOneC0' },
        ]
    },
    {
        id: 'presentation-layer',
        title: 'Presentation Layer',
        color: '#14b8a6',
        topics: [
            { id: 'pr-1', title: 'Basic Introduction to Presentation Layer', type: 'article', url: 'https://www.youtube.com/watch?v=qXJBzZ2Z7Jk' },
        ]
    },
    {
        id: 'application-layer',
        title: 'Application Layer',
        color: '#a855f7',
        topics: [
            { id: 'al-1', title: 'Domain Name System (DNS)', type: 'video', url: 'https://www.youtube.com/watch?v=27r4Bzuj5NQ' },
            { id: 'al-2', title: 'World Wide Web (WWW) and HTTP', type: 'video', url: 'https://www.youtube.com/watch?v=hExRDVZHhig' },
            { id: 'al-3', title: 'FTP (File Transfer Protocol)', type: 'video', url: 'https://www.youtube.com/watch?v=bkSWJJZNgf8' },
            { id: 'al-4', title: 'SMTP (Simple Mail Transfer Protocol)', type: 'article', url: 'https://www.youtube.com/watch?v=lhToWeuWWfw' },
            { id: 'al-5', title: 'DHCP (Dynamic Host Configuration Protocol)', type: 'video', url: 'https://www.youtube.com/watch?v=DKmBLsB-kMU' },
        ]
    },
    {
        id: 'network-sec',
        title: 'Network Security',
        color: '#eab308',
        topics: [
            { id: 'ns-1', title: 'What is Network Security?', type: 'video', url: 'https://www.youtube.com/watch?v=2OPVViV-GQk' },
            { id: 'ns-2', title: 'Cryptography basics (Symmetric vs Asymmetric)', type: 'video', url: 'https://www.youtube.com/watch?v=8wcjWZt0Nno' },
            { id: 'ns-3', title: 'Digital Signatures and Certificates', type: 'article', url: 'https://www.youtube.com/watch?v=zt0OQb1DBko' },
            { id: 'ns-4', title: 'Network Security Attacks (DDoS, MITM, Phishing)', type: 'video', url: 'https://www.youtube.com/watch?v=vvhC64hQZMk' },
            { id: 'ns-5', title: 'Firewalls and VPN (Virtual Private Network)', type: 'video', url: 'https://www.youtube.com/watch?v=U3RkDLtS7uY' },
        ]
    },
    {
        id: 'network-troubleshooting',
        title: 'Network Troubleshooting',
        color: '#22c55e',
        topics: [
            { id: 'nt-1', title: 'Ping, Traceroute, and other networking commands', type: 'video', url: 'https://www.youtube.com/watch?v=5lkNH0RYkRk' },
            { id: 'nt-2', title: 'Common networking issues and troubleshooting', type: 'video', url: 'https://www.youtube.com/watch?v=POPP2WTJ8es' },
        ]
    }
];
