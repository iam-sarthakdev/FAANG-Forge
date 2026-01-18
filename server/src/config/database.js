import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_revision';

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            // SSL/TLS options to fix connection issues
            tls: true,
            tlsAllowInvalidCertificates: true,  // For development - allows Atlas自signed certs
            tlsAllowInvalidHostnames: true,     // For development
        });
        console.log('✅ Connected to MongoDB database');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});

export default connectDB;
