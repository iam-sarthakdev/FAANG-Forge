import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CompanyProblem from '../models/CompanyProblem.js';

// ES Module equivalents of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const COMPANY_REPO_PATH = path.join(__dirname, '../data/companies');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!mongoUri) {
            console.warn('⚠️  MONGODB_URI not found in environment variables.');
            console.warn('   Skipping seed script to allow deployment to proceed.');
            console.warn('   Please set MONGODB_URI in your Railway/Vercel project settings if you want to seed data.');
            process.exit(0); // Exit successfully to prevent build failure
        }

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Parse CSV file manually (without external libraries)
const parseCSV = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const problems = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (handles quoted fields)
        const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
        if (!matches || matches.length < 6) continue;

        const fields = matches.map(m => {
            let field = m.replace(/^,/, '');
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.slice(1, -1).replace(/""/g, '"');
            }
            return field.trim();
        });

        const [difficulty, title, frequency, acceptanceRate, link, topicsStr] = fields;

        if (!title) continue;

        // Parse topics
        const topics = topicsStr
            ? topicsStr.split(',').map(t => t.trim()).filter(t => t)
            : [];

        // Normalize difficulty
        const normalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

        problems.push({
            title: title.trim(),
            difficulty: normalizedDifficulty,
            topics,
            url: link?.trim() || '',
            frequency: parseFloat(frequency) || 0,
            acceptanceRate: parseFloat(acceptanceRate) || 0
        });
    }

    return problems;
};

// Process all company directories
const seedCompanyProblems = async () => {
    try {
        console.log('🚀 Starting company problems seeding from local CSV files...\n');
        console.log('📍 Current __dirname:', __dirname);
        console.log('📍 Target COMPANY_REPO_PATH:', COMPANY_REPO_PATH);

        // Verify directory exists
        if (!fs.existsSync(COMPANY_REPO_PATH)) {
            console.error(`❌ Data directory not found at: ${COMPANY_REPO_PATH}`);
            console.error('Available directories in parent:', fs.readdirSync(path.join(__dirname, '../data')));
            return;
        }

        // Clear existing data
        const existingCount = await CompanyProblem.countDocuments();
        if (existingCount > 0) {
            console.log(`🗑️  Clearing ${existingCount} existing company problems...\n`);
            await CompanyProblem.deleteMany({});
        }

        const companies = fs.readdirSync(COMPANY_REPO_PATH, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        console.log(`📁 Found ${companies.length} company directories`);
        if (companies.length === 0) {
            console.log('Check if CSV files are correctly placed in server/src/data/companies/');
        }
        console.log('\n');

        const problemsMap = new Map(); // Use title+difficulty as key to avoid duplicates

        for (const company of companies) {
            const companyPath = path.join(COMPANY_REPO_PATH, company);
            const csvFiles = fs.readdirSync(companyPath).filter(f => f.endsWith('.csv'));

            process.stdout.write(`📊 Processing ${company}...`);

            // Only process "5. All.csv" to get all problems for each company
            const allCsvFile = csvFiles.find(f => f === '5. All.csv');
            if (!allCsvFile) {
                console.log(' ⚠️  No "5. All.csv" found, skipping');
                continue;
            }

            const csvPath = path.join(companyPath, allCsvFile);
            const rows = parseCSV(csvPath);

            let addedCount = 0;
            for (const row of rows) {
                const title = row.title;
                const difficulty = row.difficulty;

                const key = `${title}|${difficulty}`;

                if (problemsMap.has(key)) {
                    // Problem exists, add company to it
                    const existing = problemsMap.get(key);
                    if (!existing.companies.includes(company)) {
                        existing.companies.push(company);
                    }
                    // Use higher frequency if available
                    if (row.frequency > existing.frequency) {
                        existing.frequency = row.frequency;
                    }
                } else {
                    // New problem
                    row.companies = [company];
                    problemsMap.set(key, row);
                    addedCount++;
                }
            }

            console.log(` ✓ (${rows.length} problems, ${addedCount} new)`);
        }

        console.log(`\n💾 Inserting ${problemsMap.size} unique problems into database...`);

        // Insert all problems in batches
        const problemsArray = Array.from(problemsMap.values());
        const batchSize = 500;

        for (let i = 0; i < problemsArray.length; i += batchSize) {
            const batch = problemsArray.slice(i, i + batchSize);
            await CompanyProblem.insertMany(batch, { ordered: false });
            console.log(`   Inserted ${Math.min(i + batchSize, problemsArray.length)}/${problemsArray.length}`);
        }

        console.log('\n✅ Seeding completed successfully!\n');

        // Display statistics
        const stats = await CompanyProblem.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byDifficulty: [
                        {
                            $group: {
                                _id: '$difficulty',
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    companies: [
                        { $unwind: '$companies' },
                        {
                            $group: {
                                _id: '$companies',
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ]
                }
            }
        ]);

        console.log('📊 Database Statistics:');
        console.log(`   Total Problems: ${stats[0].total[0]?.count || 0}`);
        console.log('\n   By Difficulty:');
        stats[0].byDifficulty.forEach(d => {
            console.log(`   - ${d._id}: ${d.count}`);
        });

        console.log('\n   Top 10 Companies by Problem Count:');
        stats[0].companies.slice(0, 10).forEach((c, idx) => {
            console.log(`   ${idx + 1}. ${c._id}: ${c.count} problems`);
        });

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
};

// Run the seeder if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const run = async () => {
        try {
            await connectDB();
            await seedCompanyProblems();
            console.log('\n✨ All done! You can now access companies from the Companies page.');
            process.exit(0);
        } catch (error) {
            console.error('Fatal error:', error);
            process.exit(1);
        }
    };
    run();
}

export { seedCompanyProblems };
