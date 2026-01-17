# MYAUDIT 🔍
[![Firebase Deploy](https://github.com/Butterdime/MYAUDIT/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/Butterdime/MYAUDIT/actions)
[![Live Site](https://img.shields.io/badge/Live-myaudit--tax--2026-blue?logo=firebase)](https://myaudit-tax-2026.web.app)

> **The Forensic Audit & Tax Assistant for Malaysian Entities.** > Automatically parse bank statements, reconcile accounts, and stay LHDN compliant with Gemini-powered AI.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

This repository contains the MYAUDIT application, an AI-powered assistant for tax auditing.

View your app in AI Studio: https://ai.studio/apps/drive/12FeyDTtQ-MDpP-LQPHbewQhIYNTGWDPj

## 🚀 Deployment
This project is automatically deployed via **GitHub Actions** to **Firebase Hosting**.
- **Production URL:** [https://myaudit-tax-2026.web.app](https://myaudit-tax-2026.web.app)
- **CI/CD Pipeline:** Every merge to the `main` branch triggers a production build using Vite and Tailwind CSS v4.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

### Scripts

After cloning the repo, ensure helper scripts are executable:

```bash
chmod +x scripts/*.sh
```

See `docs/MYA-TECH-019.md` for the MYAUDIT control plane verification script.

## Push-to-Deploy via GitHub Actions

MYAUDIT uses GitHub Actions to deploy Firebase Functions, Firestore rules, and Hosting to the `myaudit-tax-2026` project.

### One-time setup (Founder)

1. Run `firebase login:ci` on any machine to generate a CI token.
2. Copy the long token string (starts with `1//`).
3. In GitHub, go to **Settings → Secrets and variables → Actions**.
4. Click **New repository secret**:
   - Name: `FIREBASE_TOKEN`
   - Value: paste the token.
5. Save.

### Daily workflow

- Commit and push to the `main` branch.
- GitHub Actions (`.github/workflows/deploy.yml`) will:
  - Build the frontend.
  - Install backend dependencies.
  - Run `firebase deploy --only functions,firestore:rules,hosting:myaudit-tax-2026`.
- Monitor progress and logs in the **Actions** tab in GitHub.

<!-- This is a comment to trigger deployment -->