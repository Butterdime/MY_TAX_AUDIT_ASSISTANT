#!/bin/bash
echo "🛡️ SENTINEL: Initiating Firebase Identity Retrieval..."

# Authenticate if necessary
firebase login

# Pull config for the 'Tax' project
echo "------------------------------------------------"
echo "🔍 Project: myaudit-tax-2026"
firebase apps:sdkconfig web --project myaudit-tax-2026

# Pull config for the 'Generic' project
echo "------------------------------------------------"
echo "🔍 Project: myaudit-59914983-2ad0f"
firebase apps:sdkconfig web --project myaudit-59914983-2ad0f

# List all projects to verify Resource Location (asia-southeast1)
echo "------------------------------------------------"
echo "🗺️ Global Project List"
firebase projects:list
