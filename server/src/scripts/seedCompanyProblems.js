import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Comprehensive company list from the repo
const COMPANIES = [
    'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Tesla', 'Uber',
    'LinkedIn', 'Adobe', 'Airbnb', 'Bloomberg', 'Oracle', 'Salesforce', 'Twitter',
    'Snapchat', 'TikTok', 'ByteDance', 'Goldman Sachs', 'JPMorgan', 'Morgan Stanley',
    'Citadel', 'Two Sigma', 'Jane Street', 'DE Shaw', 'DoorDash', 'Lyft', 'Stripe',
    'Coinbase', 'Robinhood', 'Square', 'PayPal', 'Visa', 'Mastercard', 'Dropbox',
    'Spotify', 'Slack', 'Zoom', 'Atlassian', 'ServiceNow', 'Splunk', 'Databricks',
    'Snowflake', 'Cloudflare', 'Twilio', 'Shopify', 'Instacart', 'Wish', 'Wayfair'
];

// Company problem schema
const companyProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    companies: [String],
    topics: [String],
    url: String,
    frequency: Number,
    acceptanceRate: Number
}, { collection: 'company_problems' });

const CompanyProblem = mongoose.model('CompanyProblem', companyProblemSchema);

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const problems = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Parse CSV line (handling quoted fields)
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

        // Parse topics
        let topics = [];
        if (topicsStr) {
            topics = topicsStr
                .replace(/^"|"$/g, '')
                .split(',')
                .map(t => t.trim())
                .filter(t => t);
        }

        // Normalize difficulty
        const normalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

        if (title && link) {
            problems.push({
                title: title.trim(),
                difficulty: normalizedDifficulty,
                topics,
                url: link.trim(),
                frequency: parseFloat(frequency) || 0,
                acceptanceRate: parseFloat(acceptanceRate) || 0
            });
        }
    }

    return problems;
}

async function fetchCompanyProblems(company) {
    const csvFiles = [
        '1.%20Thirty%20Days.csv',
        '2.%20Three%20Months.csv',
        '3.%20Six%20Months.csv',
        '4.%20More%20Than%20Six%20Months.csv',
        '5.%20All.csv'
    ];

    const allProblems = [];
    const seenProblems = new Set();

    for (const csvFile of csvFiles) {
        try {
            const url = `https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/${encodeURIComponent(company)}/${csvFile}`;
            const response = await axios.get(url);
            const problems = parseCSV(response.data);

            // Deduplicate within this company
            for (const problem of problems) {
                const key = `${problem.title}-${problem.difficulty}`;
                if (!seenProblems.has(key)) {
                    seenProblems.add(key);
                    allProblems.push(problem);
                }
            }
        } catch (error) {
            // Silently continue if a specific CSV doesn't exist
            continue;
        }
    }

    if (allProblems.length === 0) {
        console.log(`⚠️  ${company}: No data available`);
    }

    return allProblems;
}

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if already seeded
        const existingCount = await CompanyProblem.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Dropping existing ${existingCount} problems for fresh import...`);
            await CompanyProblem.deleteMany({});
        }

        console.log('\n🌱 Starting comprehensive company problems import...\n');

        const allProblemsMap = new Map(); // Use Map to deduplicate by title+difficulty
        let companiesProcessed = 0;

        // Fetch from each company
        for (const company of COMPANIES) {
            process.stdout.write(`📥 Fetching ${company}...`);

            const problems = await fetchCompanyProblems(company);

            if (problems.length > 0) {
                // Add company to each problem
                for (const problem of problems) {
                    const key = `${problem.title}-${problem.difficulty}`;

                    if (allProblemsMap.has(key)) {
                        // Problem exists, just add company
                        const existing = allProblemsMap.get(key);
                        if (!existing.companies.includes(company)) {
                            existing.companies.push(company);
                        }
                        // Use higher frequency if available
                        if (problem.frequency > existing.frequency) {
                            existing.frequency = problem.frequency;
                        }
                    } else {
                        // New problem
                        problem.companies = [company];
                        allProblemsMap.set(key, problem);
                    }
                }
                console.log(` ✓ (${problems.length} problems)`);
                companiesProcessed++;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`\n✅ Fetched from ${companiesProcessed} companies`);
        console.log(`📊 Total unique problems: ${allProblemsMap.size}`);

        // Insert into database
        console.log('\n💾 Inserting into database...');
        const problemsArray = Array.from(allProblemsMap.values());

        // Insert in batches to avoid memory issues
        const batchSize = 500;
        for (let i = 0; i < problemsArray.length; i += batchSize) {
            const batch = problemsArray.slice(i, i + batchSize);
            await CompanyProblem.insertMany(batch);
            console.log(`   Inserted ${Math.min(i + batchSize, problemsArray.length)}/${problemsArray.length}`);
        }

        console.log('\n✨ Seed completed successfully!');
        console.log(`\n📈 Summary:`);
        console.log(`   - Companies processed: ${companiesProcessed}`);
        console.log(`   - Total problems: ${allProblemsMap.size}`);

        // Show breakdown by difficulty
        const easy = problemsArray.filter(p => p.difficulty === 'Easy').length;
        const medium = problemsArray.filter(p => p.difficulty === 'Medium').length;
        const hard = problemsArray.filter(p => p.difficulty === 'Hard').length;

        console.log(`   - Easy: ${easy}`);
        console.log(`   - Medium: ${medium}`);
        console.log(`   - Hard: ${hard}`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the seed
seedDatabase();
