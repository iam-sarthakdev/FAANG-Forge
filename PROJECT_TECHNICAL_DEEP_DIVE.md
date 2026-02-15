# 🏗️ AlgoFlow: Technical Architecture & Engineering Deep Dive 
**Author:** Senior Software Engineer Perspective
**Purpose:** Internal System Mastery for Technical Reviews

---

## 🧭 1. High-Level Architecture (The "30,000 Foot View")

The system follows a classic **Client-Server 3-Tier Architecture**, tailored for read-heavy workloads (typical of educational content platforms).

### **Topology**
*   **Presentation Layer (Client):** Single Page Application (SPA) built with React. It handles state, routing, and UI rendering. Crucially, it is **"Thick Client"**, meaning it performs significant data merging (e.g., combining Company Problems with User Progress) to reduce backend compute load.
*   **Application Layer (Server):** Node.js/Express REST API. It is **stateless** (REST constraint), relying on JWTs for auth. It acts as an orchestrator between the client and the database.
*   **Persistence Layer (Database):** MongoDB (Atlas). Chosen for its "Document" model, which maps naturally to the hierarchical structure of problems, lists, and sections.

### **Network Trace of a Request**
*   **User Action:** User clicks "Mark as Revised".
*   **Client:** `Axios` interceptor attaches `Authorization: Bearer <token>`. Sends `POST /api/problems/:id/revise`.
*   **Server (Express):**
    1.  `cors` middleware checks origin.
    2.  `express.json` parses body.
    3.  `verifyToken` middleware decodes JWT, verifying signature. Attaches `req.user`.
    4.  `problemController` executes business logic (calculates date).
    5.  `Mongoose` sends update command to Atlas.
*   **Database:** Updates document, re-indexes `next_reminder_date`.
*   **Response:** JSON 200 OK with updated revision count.

---

## 🛠️ 2. Feature Implementation Internals

### **A. Intelligent Problem Management (The Spaced Repetition Engine)**

This is the system's "Killer Feature". It transforms static lists into a dynamic schedule.

*   **The Physics (Algorithm):**
    We use a simplified **Ebbinghaus Forgetting Curve** implementation (similar to SuperMemo-2).
    *   **Interval Array:** `[1, 3, 7, 14, 30, 60, 90]` (days).
    *   **State:** Each problem has a `revision_count` (int).
    *   **Computation:** `next_date = current_date + intervals[min(revision_count, max_interval)]`.
    *   **Why this works:** It prioritizes items you are *about to forget*, maximizing memory retention efficiency.

*   **Engineering Challenge:** "How do we efficiently query 'What is due today'?"
    *   **Naive Approach:** Fetch all user problems, loop in JavaScript. (O(N) - Slow for heavy users).
    *   **Senior Engineer Approach:** Database Indexing.
        We index `next_reminder_date`. The query becomes a range query:
        ```javascript
        db.problems.find({ 
           userId: uid, 
           next_reminder_date: { $lte: new Date() } // "Less than or equal to now"
        })
        ```
        This is an **O(log N)** operation for the database, scalable to millions of records.

### **B. Problem Lists (Curated Sheets)**

*   **Data Structure:**
    Instead of flat lists, we deal with "Trees": `Sheet -> Sections -> Problems`.
    *   **NeetCode 150** is a *Sheet*.
    *   **Arrays & Hashing** is a *Section*.
    *   **Two Sum** is a *Problem*.

*   **Storage Strategy (Embedded Documents):**
    We store the entire tree in a single MongoDB document.
    *   *Why?* **Data Locality**. When a user opens "NeetCode 150", they want the *whole* list. Storing references (IDs) to sections would require `$lookup` (Joins) which are slower. Embedding gives us single-read performance.

### **C. The "Dual-Source" Merge Strategy (Frontend)**

This is the most complex logical operation in the client.

*   **The Constraint:**
    *   **Source A:** `CompanyProblems` (7,000+ items, Read-Only, Shared).
    *   **Source B:** `UserProblems` (User's specific progress, Read-Write, Private).
*   **The requirement:** Show the "Google" list, but if I've solved "Two Sum", show *my* status (Green checkmark), not the generic one.
*   **The Implementation:**
    We perform an **In-Memory Merge (Client-Side Join)**.
    1.  Fetch `CompanyProblems(Google)`.
    2.  Fetch `UserProblems`.
    3.  Create a `HashMap` (Lookup Table) of User Problems: `Map<Title, ProblemObj>`. Construction is O(U).
    4.  Iterate Company Problems. For each, check `map.has(title)`. Lookup is O(1).
    5.  If match, use User Problem. If not, use Company Problem.
    *   **Complexity:** O(U + C) (Linear). Very efficient compared to doing this join on the backend for every request.

---

## 🚿 3. Database Seeding Architecture (Data Pipelines)

We handle two distinct types of data ingestion.

### **Pipeline 1: The "Famous Sheets" (Structure Oriented)**
*   **Source:** Hardcoded JavaScript Objects (`server/src/data/neetcode150.js`).
*   **Why Hardcoded?** Reliability. GitHub APIs can be rate-limited or change schema. The structure of "NeetCode 150" rarely changes, so "Configuration as Code" is safer.
*   **Mechanism:** `seedFamousLists` controller.
*   **Idempotency:** Crucial concept. The script uses `findOneAndUpdate` with `upsert: true`.
    *   *Effect:* You can run the script 100 times. It will not duplicate data. It ensures the DB state matches the Code state.

### **Pipeline 2: Company Problems (Volume Oriented)**
*   **Source:** CSV Files (`server/src/data/companies/*.csv`).
*   **Why CSV?** Compactness. Storing 7,000 items in JSON is verbose. CSV is efficient for bulk data.
*   **Mechanism:** `seedCompanyProblemsLocal.js`.
    1.  **Stream Processing:** Uses `fs.createReadStream` + `csv-parser`. It reads the file chunk-by-chunk, not forcing the whole 50MB file into memory (preventing Heap Out of Memory).
    2.  **Transformation:** Maps CSV columns (`Title`, `Difficulty`) to Mongoose Schema.
    3.  **Bulk Write:** Accumulates records and uses `Model.insertMany()`.
        *   *Trade-off:* `insertMany` is faster than `save()` in a loop, but if one record fails, the batch can fail (unless `ordered: false` is set). We accept this for speed.

---

## 🔐 4. Authentication & Security Analysis

### **Stateless Auth (JWT)**
*   **Mechanism:** We issue a signed token (HS256 algorithm).
*   **Payload:** `{ userId: "...", iat: ..., exp: ... }`.
*   **Security Posture:**
    *   **Password Storage:** `bcryptjs` (Salt + Hash). We never store plain text.
    *   **Token Storage:** `localStorage`.
        *   *Critique:* Vulnerable to XSS. If a malicious script runs on the page, it can read `localStorage`.
        *   *Defense:* We depend on React's escaping (preventing HTML injection) and plan to move to `HttpOnly` cookies for "Banking Grade" security in v2.

---

## 🚀 5. Performance Engineering (The Google Standard)

### **Frontend Optimization**
1.  **Code Splitting:** Vite automatically chunks the bundle.
2.  **Virtualization (Planned):** For list of 7,000 problems, we render mostly just the visible ones (DOM Recycling).
3.  **Debouncing:** Search inputs (e.g., searching for "Google") utilize debouncing (waiting 300ms after user stops typing) to prevent flooding the API with requests for every keystroke.

### **Backend Optimization**
1.  **Indexing:** `userId` and `next_reminder_date` are indexed. Without this, the app would die at 10,000 users.
2.  **Projection:** API calls select specific fields (`.select('title difficulty isSolved')`). We don't send the full `codeSnippet` or `notes` when just listing problems. This saves bandwidth (Network I/O).

---

## 🔮 6. Scalability Bottlenecks (What breaks first?)

If we scale to 1 Million users:
1.  **Monolithic Database:** A single write-master MongoDB instance will lock up.
    *   *Fix:* Sharding (Partitioning data by `userId`).
2.  **Search Performance:** MongoDB regex search (`$regex`) is slow (O(N) scan).
    *   *Fix:* Implement ElasticSearch or Atlas Search (Lucene-based) for full-text search capabilities.
