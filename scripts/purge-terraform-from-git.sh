#!/bin/bash
# MYΛUDIT Git Substrate Recovery v1.0
# Objective: Purge large Terraform binaries from Git history to unblock Push.

echo "🛡️ SENTINEL: Initiating Git History Purge..."

# 1. Update .gitignore immediately
echo "📝 Updating .gitignore..."
cat >> .gitignore << 'EOF'
.terraform/
terraform.tfstate
terraform.tfstate.backup
.terraform.lock.hcl
EOF

# 2. Remove the folder from the current index (staged changes)
echo "🗑️ Removing large files from staging..."
git rm -r --cached infrastructure/terraform/.terraform/ 2>/dev/null || true

# 3. Purge from history (using filter-branch as it is built-in)
# Warning: This rewrites history. 
echo "☢️ Purging .terraform from all previous commits..."
git filter-branch --force --index-filter \
  'git rm -r --cached --ignore-unmatch infrastructure/terraform/.terraform' \
  --prune-empty --tag-name-filter cat -- --all

# 4. Cleanup and reclaim space
echo "🧹 Cleaning up git objects..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now
git gc --aggressive --prune=now

echo "✅ Purge complete. Attempting to push to main..."
git push origin main --force
