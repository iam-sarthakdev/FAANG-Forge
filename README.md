# DSA Spaced Revision System

A production-grade full-stack application to track DSA problems and automatically schedule revision reminders using spaced repetition principles.

## 🎯 Project Overview

This is **NOT** a tutorial project - it's a MAANG-level system designed with:
- Clean, production-quality code
- Proper separation of concerns
- Optimized database queries with strategic indexes
- Scalable architecture
- Modern, beautiful UI

## 🏗️ Architecture

**3-Tier Architecture:**
- **Frontend**: React + Vite with Tailwind CSS
- **Backend**: Node.js + Express REST API
- **Database**: MongoDB with Mongoose ODM
- **Scheduler**: node-cron for automated reminder updates

## ✨ Features

### Core Features
- ✅ Problem Management (Add, Edit, Delete, View)
- ✅ Revision Tracking with history
- ✅ Automated Reminder Scheduling (daily cron job)
- ✅ Dashboard with Today/Overdue/Upcoming reminders
- ✅ Advanced Filtering & Sorting
- ✅ Analytics with charts (by topic, difficulty, most revised)
- ✅ Revision Streak tracking

### Technical Highlights
- MongoDB aggregation pipeline for analytics
- Strategic database indexes for performance
- Glass morphism UI with gradient animations
- Responsive Recharts visualizations
- RESTful API design
- Error handling & validation

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas free tier)

---

### **Option 1: MongoDB Atlas (Cloud - Easiest)**

1. **Create Free MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free
   - Create a free cluster (M0)

2. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dsa_revision
   ```

3. **Configure Backend**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env and paste your connection string
   ```

4. **Seed Database**
   ```bash
   npm install
   node ../database/seed.js
   ```

---

### **Option 2: Local MongoDB**

1. **Install MongoDB**
   - Download from [mongodb.com/download-center/community](https://www.mongodb.com/try/download/community)
   - Or use Docker:
   ```bash
   docker run --name mongodb-dsa -p 27017:27017 -d mongo
   ```

2. **Configure Backend**
   ```bash
   cd server
   cp .env.example .env
   # Default: MONGODB_URI=mongodb://localhost:27017/dsa_revision
   ```

3. **Seed Database**
   ```bash
   npm install
   node ../database/seed.js
   ```

   You should see:
   ```
   ✅ Connected to MongoDB
   🗑️  Cleared existing data
   ✅ Inserted 15 problems
   ✅ Inserted 7 revisions
   🎉 Database seeded successfully!
   ```

---

### **Start Backend**

```bash
cd server
npm start
```

You should see:
```
✅ Connected to MongoDB database
🚀 Server running on http://localhost:5000
📅 Reminder cron job scheduled
```

Keep this terminal open!

---

### **Start Frontend** (New Terminal)

```bash
cd client
npm install
npm run dev
```

You should see:
```
VITE v5.x.x ready in Xms
➜  Local:   http://localhost:5173/
```

---

### **Open in Browser**

1. Go to: **http://localhost:5173**
2. You should see the beautiful dashboard with 15 sample problems!

---

## 📁 Project Structure

```
dsa-revision-system/
├── server/               # Backend
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── models/       # Mongoose schemas
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # Express routes
│   │   ├── middleware/   # Validation & error handling
│   │   ├── jobs/         # Cron scheduler
│   │   └── server.js     # Entry point
│   └── package.json
│
├── client/               # Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   ├── utils/        # Helper functions
│   │   └── App.jsx
│   └── package.json
│
└── database/
    └── seed.js           # MongoDB seed script
```

## 🎨 UI Features

- **Modern Glass Morphism**: Frosted glass cards with blur effects
- **Gradient Animations**: Smooth hover transitions and floating effects
- **Responsive Charts**: Bar and pie charts using Recharts
- **Dynamic Badges**: Color-coded difficulty and topic badges
- **Dark Theme**: Purple-gradient background with excellent contrast

## 🧪 Testing the Application

### 1. Verify Database
```bash
# Using MongoDB Compass (GUI)
# Connect to: mongodb://localhost:27017
# Check database: dsa_revision
# Collections: problems (15 docs), revisions (7 docs)

# Using mongosh (CLI)
mongosh
use dsa_revision
db.problems.count()  // Should show 15
```

### 2. Test API Endpoints
```bash
# Get all problems
curl http://localhost:5000/api/problems

# Get dashboard reminders
curl http://localhost:5000/api/dashboard/reminders

# Get analytics
curl http://localhost:5000/api/analytics
```

### 3. Test Frontend
1. Open `http://localhost:5173`
2. Navigate through Dashboard, Problems, Analytics pages
3. Add a new problem
4. Mark a problem as revised
5. Check analytics charts update

## 📊 Database Schema

### `problems` Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max 200 chars),
  url: String,
  topic: String (required, indexed),
  difficulty: String (Easy/Medium/Hard, indexed),
  notes: String,
  next_reminder_date: Date (indexed),
  status: String (pending/overdue/no_reminder, indexed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### `revisions` Collection
```javascript
{
  _id: ObjectId,
  problem_id: ObjectId (ref: Problem, indexed),
  notes: String,
  revised_at: Date (indexed)
}
```

### Indexes
- `next_reminder_date` + `status` - Used by cron job
- `topic` - Filtering UI
- `difficulty` - Filtering UI
- `problem_id` (in revisions) - JOIN lookups

## 🔄 How Reminders Work

1. **Cron Job** runs daily at midnight
2. Queries problems where `next_reminder_date < TODAY`
3. Updates `status` to 'overdue' or 'pending'
4. Dashboard displays problems grouped by status
5. User marks as revised → Sets new reminder date

## 📈 Scalability (For Interviews)

### Current Limits
- Single server instance: ~10k users
- MongoDB: Millions of problems (with indexes)

### Scaling to 100k Users
1. **Horizontal Scaling**: Load balancer + multiple API servers
2. **Distributed Cron**: Migrate to Bull + Redis queue
3. **Database**: MongoDB sharding by user_id
4. **Caching**: Redis for dashboard queries

## 🎤 Interview Talking Points

**Why MongoDB?**
- Easy setup (Atlas free tier)
- Flexible schema (can add fields without migrations)
- Good for this use case (date queries work well)
- Aggregation pipeline for analytics

**MongoDB vs PostgreSQL Trade-offs**
- ✅ MongoDB: Easier setup, flexible schema
- ✅ PostgreSQL: Stronger ACID, better relational integrity, partial indexes
- For this MVP: MongoDB's ease-of-use wins

**Database Optimization**
- Indexed common query fields (topic, difficulty, next_reminder_date)
- Aggregation pipeline for analytics (groups, counts)
- Compound index on `next_reminder_date` + `status` for cron job

## ⚠️ Troubleshooting

**Backend won't start:**
- Check MongoDB is running: `mongosh` (should connect)
- Verify `.env` MONGODB_URI is correct
- For Atlas: Check IP whitelist (allow 0.0.0.0/0 for development)

**Frontend shows errors:**
- Make sure backend is running first (http://localhost:5000)
- Check browser console for errors (F12)

**Can't connect to MongoDB:**
```bash
# Test local connection
mongosh mongodb://localhost:27017
```

## 📝 API Documentation

**Base URL**: `http://localhost:5000/api`

### Key Endpoints
- `POST /api/problems` - Create problem
- `GET /api/problems` - List with filters
- `GET /api/problems/:id` - Get problem details
- `PATCH /api/problems/:id` - Update problem
- `DELETE /api/problems/:id` - Delete problem
- `POST /api/problems/:id/revisions` - Mark as revised
- `GET /api/dashboard/reminders` - Get dashboard data
- `GET /api/analytics` - Get aggregated stats

## 🛠️ Tech Stack

| Technology | Why? |
|-----------|------|
| **React** | Component reusability, rich ecosystem |
| **Vite** | 10x faster than CRA, modern tooling |
| **Tailwind** | Rapid UI dev, consistent design |
| **Express** | Minimal, unopinionated, easy to explain |
| **MongoDB** | Easy setup, flexible schema, great for rapid development |
| **Mongoose** | Schema validation, middleware, clean API |
| **node-cron** | Simple in-process scheduler for MVP |
| **Recharts** | React-native, declarative charts |

---

**License**: MIT

**Note**: This is a portfolio/learning project. Not intended for commercial use without proper authentication and security measures.
