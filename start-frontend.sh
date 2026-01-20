#!/bin/bash

# BharatPrint Frontend Startup Script

echo "🚀 Starting BharatPrint Frontend..."
echo ""

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages..."
    npm install
fi

# Start development server
echo ""
echo "✅ Starting frontend on http://localhost:3000"
echo ""
npm start
