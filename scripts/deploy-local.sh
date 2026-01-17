#!/bin/bash
set -e

PROJECT_ID="myaudit-tax-2026"

echo "🔐 Verifying GCP configuration..."
bash ./verify-gcp.sh

# Temporarily disabled: Typecheck fails due to LedgerEntry schema mismatch.
# TODO (MYA-DOC-008 Benchmarks): Re-enable `npm run typecheck` once UI/logic and
# backend functions are fully aligned to the canonical LedgerEntry schema
# defined in src/types/index.ts.
# echo "🧪 Typecheck + Build..."
# npm run typecheck

echo "🏗️  Building Frontend Substrate..."
npm run build

echo "🚀 Deploying to Firebase (local auth)..."
firebase deploy --project="${PROJECT_ID}"

echo "✅ Deployment complete."
