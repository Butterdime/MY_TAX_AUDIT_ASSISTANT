#!/bin/bash

# Firebase Auth Verification Script
# This script verifies Firebase project alignment and provides commands to test Auth initialization

set -e

echo "=========================================="
echo "Firebase Auth Verification Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify Firebase CLI is installed
echo "Step 1: Checking Firebase CLI installation..."
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✓${NC} Firebase CLI is installed"
    firebase --version
else
    echo -e "${RED}✗${NC} Firebase CLI is not installed"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi
echo ""

# Step 2: Verify active project
echo "Step 2: Checking active Firebase project..."
ACTIVE_PROJECT=$(firebase use 2>&1 | grep -oP '(?<=Using )\S+' || echo "")
if [ -z "$ACTIVE_PROJECT" ]; then
    ACTIVE_PROJECT=$(firebase projects:list | grep "(current)" | awk '{print $2}' || echo "")
fi

if [ "$ACTIVE_PROJECT" = "myaudit-59914983-2ad0f" ]; then
    echo -e "${GREEN}✓${NC} Active project: $ACTIVE_PROJECT"
else
    echo -e "${YELLOW}⚠${NC} Active project: $ACTIVE_PROJECT"
    echo "Expected: myaudit-59914983-2ad0f"
    echo "Switch with: firebase use myaudit-59914983-2ad0f"
fi
echo ""

# Step 3: Verify .firebaserc
echo "Step 3: Checking .firebaserc configuration..."
if [ -f ".firebaserc" ]; then
    FIREBASERC_PROJECT=$(grep -oP '(?<="default": ")[^"]+' .firebaserc || echo "")
    if [ "$FIREBASERC_PROJECT" = "myaudit-59914983-2ad0f" ]; then
        echo -e "${GREEN}✓${NC} .firebaserc points to: $FIREBASERC_PROJECT"
    else
        echo -e "${YELLOW}⚠${NC} .firebaserc points to: $FIREBASERC_PROJECT"
        echo "Expected: myaudit-59914983-2ad0f"
    fi
else
    echo -e "${RED}✗${NC} .firebaserc file not found"
fi
echo ""

# Step 4: Verify environment variables (if .env exists)
echo "Step 4: Checking environment configuration..."
if [ -f ".env" ] || [ -f ".env.local" ]; then
    ENV_FILE=$(ls .env .env.local 2>/dev/null | head -1)
    if grep -q "VITE_FIREBASE_PROJECT_ID" "$ENV_FILE" 2>/dev/null; then
        ENV_PROJECT_ID=$(grep "VITE_FIREBASE_PROJECT_ID" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ "$ENV_PROJECT_ID" = "myaudit-59914983-2ad0f" ]; then
            echo -e "${GREEN}✓${NC} VITE_FIREBASE_PROJECT_ID in $ENV_FILE: $ENV_PROJECT_ID"
        else
            echo -e "${YELLOW}⚠${NC} VITE_FIREBASE_PROJECT_ID in $ENV_FILE: $ENV_PROJECT_ID"
            echo "Expected: myaudit-59914983-2ad0f"
        fi
    else
        echo -e "${YELLOW}⚠${NC} VITE_FIREBASE_PROJECT_ID not found in $ENV_FILE"
    fi
else
    echo -e "${YELLOW}⚠${NC} No .env or .env.local file found"
    echo "Note: Environment variables may be set in deployment environment"
fi
echo ""

# Step 5: Verify src/firebase.ts structure
echo "Step 5: Checking src/firebase.ts configuration..."
if [ -f "src/firebase.ts" ]; then
    if grep -q "getAuth" "src/firebase.ts"; then
        echo -e "${GREEN}✓${NC} src/firebase.ts contains Auth initialization"
    else
        echo -e "${RED}✗${NC} src/firebase.ts does not contain Auth initialization"
    fi
    
    if grep -q "VITE_FIREBASE_PROJECT_ID" "src/firebase.ts"; then
        echo -e "${GREEN}✓${NC} src/firebase.ts uses environment variables"
    else
        echo -e "${YELLOW}⚠${NC} src/firebase.ts may not use environment variables"
    fi
else
    echo -e "${RED}✗${NC} src/firebase.ts not found"
fi
echo ""

# Step 6: Browser verification instructions
echo "=========================================="
echo "Browser Verification Steps"
echo "=========================================="
echo ""
echo "After enabling Email/Password in Firebase Console:"
echo ""
echo "1. Start the app:"
echo "   npm run dev"
echo ""
echo "2. Open browser console and check for:"
echo "   - No 'provider disabled' errors"
echo "   - No 'auth/configuration-not-found' errors"
echo "   - window._firebaseConfig should show:"
echo "     * projectId: 'myaudit-59914983-2ad0f'"
echo "     * authDomain: (should match Firebase project)"
echo "     * apiKey: true"
echo ""
echo "3. Test Auth initialization (in browser console):"
echo "   import { auth } from './firebase';"
echo "   console.log('Auth initialized:', !!auth);"
echo ""
echo "4. Verify in Firebase Console:"
echo "   - Go to Authentication → Users"
echo "   - Tab should be accessible (indicates Auth is initialized)"
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
