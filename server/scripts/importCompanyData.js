import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Problem } from '../src/models/index.js';
import User from '../src/models/User.js';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const REPO_PATH = path.join(__dirname, '../../temp_company_repo');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
}

// Simple CSV Parser
function parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        // Handle quoted fields
        const row = [];
        let inQuotes = false;
        let currentField = '';

        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        row.push(currentField.trim());

        if (row.length === headers.length) {
            const entry = {};
            headers.forEach((h, idx) => {
                entry[h] = row[idx];
            });
            data.push(entry);
        }
    }
    return data;
}

function formatDifficulty(diff) {
    if (!diff) return 'Medium';
    const d = diff.toLowerCase();
    return d.charAt(0).toUpperCase() + d.slice(1);
}

async function importCompanyData() {
    await connectDB();

    try {
        const defaultUser = await User.findOne({});
        if (!defaultUser) {
            console.error('No users found in database! Please create a user first.');
            process.exit(1);
        }
        console.log(`Using Default User: ${defaultUser.email} (${defaultUser._id})`);

        const companies = fs.readdirSync(REPO_PATH).filter(f => fs.statSync(path.join(REPO_PATH, f)).isDirectory() && !f.startsWith('.'));
        console.log(`Found ${companies.length} companies.`);

        let totalProcessed = 0;
        let totalUpdated = 0;
        let totalCreated = 0;

        for (const company of companies) {
            let csvPath = path.join(REPO_PATH, company, '5. All.csv');
            if (!fs.existsSync(csvPath)) {
                const files = fs.readdirSync(path.join(REPO_PATH, company));
                const allCsv = files.find(f => f.includes('All.csv'));
                if (allCsv) csvPath = path.join(REPO_PATH, company, allCsv);
                else continue;
            }

            const content = fs.readFileSync(csvPath, 'utf8');
            const problems = parseCSV(content);

            for (const p of problems) {
                if (!p.Title || !p.Link) continue;

                const title = p.Title.replace(/"/g, '');

                let problem = await Problem.findOne({
                    $or: [
                        { title: title, user_id: defaultUser._id },
                        { url: p.Link, user_id: defaultUser._id }
                    ]
                });

                const companyTag = company;
                let csvTopics = [];
                if (p.Topics) {
                    csvTopics = p.Topics.replace(/"/g, '').split(',').map(t => t.trim()).filter(t => t);
                }
                const primaryTopic = csvTopics.length > 0 ? csvTopics[0] : 'Uncategorized';

                if (problem) {
                    let updated = false;
                    if (!problem.companies.includes(companyTag)) {
                        problem.companies.push(companyTag);
                        updated = true;
                    }
                    if (updated) {
                        await problem.save();
                        totalUpdated++;
                    }
                } else {
                    const diff = formatDifficulty(p.Difficulty);
                    const newProblem = new Problem({
                        user_id: defaultUser._id,
                        title: title,
                        url: p.Link,
                        difficulty: ['Easy', 'Medium', 'Hard'].includes(diff) ? diff : 'Medium',
                        topic: primaryTopic,
                        companies: [companyTag],
                        patterns: [], // We don't overwrite patterns from CSV as they are 'Tags' usually
                        tags: csvTopics,
                        status: 'pending', // Correct Enum
                        codeSnippet: '',
                        isSolved: false
                    });

                    await newProblem.save();
                    totalCreated++;
                }
                totalProcessed++;
            }
            if (totalProcessed % 500 === 0) console.log(`Processed ${totalProcessed}...`);
        }

        console.log('Import Complete!');
        console.log(`Processed: ${totalProcessed}`);
        console.log(`Updated: ${totalUpdated}`);
        console.log(`Created: ${totalCreated}`);

    } catch (err) {
        console.error('Import Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

importCompanyData();
