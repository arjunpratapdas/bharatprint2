#!/bin/bash

# BharatPrint Backend Setup Script
# This script sets up a Python virtual environment and installs dependencies

echo "🚀 Setting up BharatPrint Backend..."
echo "======================================"
echo ""

cd /home/arjun/Downloads/BHARATPRINTmain2/backend

# Check if venv exists
if [ -d "venv" ]; then
    echo "✅ Virtual environment already exists"
else
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

echo ""
echo "⚙️ Activating virtual environment..."
source venv/bin/activate

echo "✅ Virtual environment activated"
echo ""

echo "📥 Installing dependencies from requirements.txt..."
pip install --upgrade pip setuptools wheel -q
pip install -r requirements.txt -q

echo "✅ Dependencies installed successfully!"
echo ""

echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "To start the backend server, run:"
echo ""
echo "  cd /home/arjun/Downloads/BHARATPRINTmain2/backend"
echo "  source venv/bin/activate"
echo "  python -m uvicorn server:app --reload"
echo ""
