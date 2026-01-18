-- DSA Spaced Revision System - Database Schema
-- PostgreSQL 14+

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS revisions CASCADE;
DROP TABLE IF EXISTS problems CASCADE;

-- Problems table
CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  url TEXT,
  topic VARCHAR(50) NOT NULL,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  notes TEXT,
  next_reminder_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'overdue', 'no_reminder')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Revisions table
CREATE TABLE revisions (
  id SERIAL PRIMARY KEY,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  revised_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Indexes for performance optimization

-- Most critical: Used by cron job daily to find due reminders
-- Partial index only for problems with reminders set
CREATE INDEX idx_problems_next_reminder ON problems(next_reminder_date) 
WHERE next_reminder_date IS NOT NULL;

-- Used for filtering in UI
CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_status ON problems(status);

-- Used for JOIN operations when fetching problem details
CREATE INDEX idx_revisions_problem_id ON revisions(problem_id);

-- Used for "recent revisions" and streak calculations
CREATE INDEX idx_revisions_revised_at ON revisions(revised_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on problem updates
CREATE TRIGGER update_problems_updated_at
BEFORE UPDATE ON problems
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
