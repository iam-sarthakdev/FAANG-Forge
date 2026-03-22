import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const migrateUsernames = async () => {
    await connectDB();

    try {
        const users = await User.find({ username: { $exists: false } });
        console.log(`Found ${users.length} users needing usernames.`);

        let count = 0;
        for (const user of users) {
             // The pre-save hook in User.js handles auto-generation
             // But we need to make sure we save it to trigger the hook
             user.markModified('name'); // Just to ensure it saves if it thinks nothing changed
             await user.save();
             count++;
             console.log(`Updated user ${user.email} -> ${user.username}`);
        }

        console.log(`Successfully generated usernames for ${count} users.`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit(0);
    }
};

migrateUsernames();
