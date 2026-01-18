@echo off
echo Starting DSA Revision System...

:: Start Backend
start "DSA Backend" cmd /k "cd server && npm run dev"

:: Start Frontend
start "DSA Frontend" cmd /k "cd client && npm run dev"

echo Both servers are launching in separate windows.
echo Please wait for them to initialize (look for "Connected to MongoDB" and "Local: http://localhost:5173").
