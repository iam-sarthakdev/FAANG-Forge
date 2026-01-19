# Render.com Deployment

## Steps to Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New** → **Web Service**
3. Connect your **AlgoFlow** repository
4. Configure:
   - **Name**: `algoflow-api`
   - **Region**: `Singapore` (closest to Mumbai)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI` = `mongodb+srv://sarthak1712005_db_user:AlgoFlow2026@notesapp.h2ibadt.mongodb.net/dsa_revision?retryWrites=true&w=majority&appName=NotesApp`
   - `NODE_ENV` = `production`
6. Click **Create Web Service**
7. Wait for deployment (2-3 minutes)
8. Copy the Render URL and update Vercel frontend

## After Deployment
Update your Vercel frontend's `VITE_API_URL` to point to the new Render URL.
