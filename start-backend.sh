#!/bin/bash

# BharatPrint Backend Startup Script

echo "🚀 Starting BharatPrint Backend..."
echo ""

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Start server
echo ""
echo "✅ Starting server on http://localhost:8000"
echo ""
python server.py
