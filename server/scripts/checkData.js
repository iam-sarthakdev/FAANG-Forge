import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Problem } from '../src/models/index.js';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`- User: ${u.email} (ID: ${u._id})`));

        const totalProblems = await Problem.countDocuments({});
        console.log(`Total Problems: ${totalProblems}`);

        const problemsWithCompany = await Problem.countDocuments({ companies: { $exists: true, $not: { $size: 0 } } });
        console.log(`Problems with Companies: ${problemsWithCompany}`);

        if (problemsWithCompany > 0) {
            const sample = await Problem.findOne({ companies: { $exists: true, $not: { $size: 0 } } });
            console.log('Sample Problem with Company:', JSON.stringify(sample, null, 2));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
