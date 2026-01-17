#!/bin/bash
# MYAUDIT Control Plane Verification v1.1
# Generated 2026-01-17 for Google for Startups Evidence

PROJECT_ID="rpr-myaudit"
TARGET_ORG="566551209016"
TARGET_REGION="asia-southeast1"

# Extract Current State
PARENT_ID=$(gcloud projects describe $PROJECT_ID --format='value(parent.id)')
CURRENT_REGION=$(gcloud firestore databases list --project=$PROJECT_ID --format="value(locationId)" --filter="name:default" 2>/dev/null)
BILLING_STATUS=$(gcloud beta billing projects describe $PROJECT_ID --format='value(billingEnabled)')

# Evaluation Logic
ORG_STATUS="FAIL"
[[ "$PARENT_ID" == "$TARGET_ORG" ]] && ORG_STATUS="OK"

REGION_STATUS="FAIL"
[[ "$CURRENT_REGION" == "$TARGET_REGION" ]] && REGION_STATUS="OK"

BILLING_FINAL="FAIL"
[[ "$BILLING_STATUS" == "True" ]] && BILLING_FINAL="OK"

echo "------------------------------------------------"
echo "🛡️ MYAUDIT SOVEREIGN SUBSTRATE VERIFICATION"
echo "------------------------------------------------"
echo "PROJECT_ID:      $PROJECT_ID"
echo "ORG_PARENT:      $PARENT_ID (Status: $ORG_STATUS)"
echo "DATA_RESIDENCY:  $CURRENT_REGION (Status: $REGION_STATUS)"
echo "BILLING_ACTIVE:  $BILLING_STATUS (Status: $BILLING_FINAL)"
echo "------------------------------------------------"

if [ "$ORG_STATUS" == "FAIL" ] || [ "$REGION_STATUS" == "FAIL" ] || [ "$BILLING_FINAL" == "FAIL" ]; then
    echo "❌ VERIFICATION FAILED: Substrate does not meet SENTINEL mandates."
    exit 1
fi

echo "✅ VERIFICATION SUCCESS: Substrate is Startup-Ready."
exit 0
