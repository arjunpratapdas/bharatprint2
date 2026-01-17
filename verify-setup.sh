#!/bin/bash

# BharatPrint Setup Verification Script
# This script verifies that all Firebase configuration is correct

echo "🔍 Verifying BharatPrint Firebase Setup..."
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check file existence
check_file() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $name exists"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $name NOT FOUND: $file"
        ((CHECKS_FAILED++))
    fi
}

# Function to check JSON validity
check_json() {
    local file=$1
    local name=$2
    if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $name is valid JSON"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $name is NOT valid JSON"
        ((CHECKS_FAILED++))
    fi
}

# Function to check environment variable
check_env_var() {
    local file=$1
    local var=$2
    local name=$3
    if grep -q "^${var}=" "$file"; then
        echo -e "${GREEN}✅${NC} $name configured"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $name NOT configured"
        ((CHECKS_FAILED++))
    fi
}

# Function to check Python/Node/npm
check_command() {
    local cmd=$1
    local name=$2
    if command -v "$cmd" &> /dev/null; then
        echo -e "${GREEN}✅${NC} $name installed"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $name NOT installed"
        ((CHECKS_FAILED++))
    fi
}

echo "📁 CHECKING CONFIGURATION FILES"
echo "--------------------------------"
check_file "backend/firebase-service-account-key.json" "Firebase Service Account Key"
check_file "backend/.env" "Backend Environment File"
check_file "frontend/.env.local" "Frontend Environment File"
check_file "frontend/src/lib/firebase.js" "Firebase Configuration (Code)"
echo ""

echo "🔐 CHECKING CONFIGURATION VALIDITY"
echo "-----------------------------------"
check_json "backend/firebase-service-account-key.json" "Firebase Credentials JSON"
if [ -f "backend/.env" ]; then
    check_env_var "backend/.env" "FIREBASE_CREDENTIALS_PATH" "Firebase Path in .env"
    check_env_var "backend/.env" "JWT_SECRET" "JWT Secret in .env"
fi
echo ""

echo "🛠️ CHECKING DEPENDENCIES"
echo "------------------------"
check_command "python3" "Python 3"
check_command "python" "Python"
check_command "node" "Node.js"
check_command "npm" "npm"
echo ""

echo "📦 CHECKING PYTHON PACKAGES"
echo "----------------------------"
if python3 -c "import firebase_admin" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} firebase-admin installed"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠️${NC} firebase-admin NOT installed (install with: pip install -r requirements.txt)"
    ((CHECKS_FAILED++))
fi

if python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} fastapi installed"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠️${NC} fastapi NOT installed (install with: pip install -r requirements.txt)"
    ((CHECKS_FAILED++))
fi
echo ""

echo "🔍 CHECKING CODE FILES"
echo "----------------------"
check_file "backend/server.py" "Backend Server Code"
check_file "frontend/src/pages/auth/Signup.js" "Signup Component"
check_file "frontend/src/lib/api.js" "API Integration"
echo ""

echo "📱 CHECKING FRONTEND PACKAGES"
echo "-----------------------------"
if [ -d "frontend/node_modules/firebase" ]; then
    echo -e "${GREEN}✅${NC} Firebase SDK installed in frontend"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠️${NC} Firebase SDK NOT installed (install with: npm install)"
    ((CHECKS_FAILED++))
fi
echo ""

echo "=========================================="
echo "📊 VERIFICATION SUMMARY"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "You're ready to run the application!"
    echo ""
    echo "Start the servers with:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend"
    echo "  python -m uvicorn server:app --reload"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd frontend"
    echo "  npm start"
    echo ""
    exit 0
else
    echo -e "${RED}❌ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please fix the issues above before running the application."
    echo ""
    if [ ! -d "frontend/node_modules" ]; then
        echo "To install frontend dependencies:"
        echo "  cd frontend && npm install"
        echo ""
    fi
    if ! python3 -c "import firebase_admin" 2>/dev/null; then
        echo "To install backend dependencies:"
        echo "  cd backend && pip install -r requirements.txt"
        echo ""
    fi
    exit 1
fi
