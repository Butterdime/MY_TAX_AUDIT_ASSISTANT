# PRD: MYAUDIT v1.1 – UPDATED WITH TAX INTELLIGENCE LAYER

## Product Requirement Document for Malaysian SME Audit-Ready Accounting Engine

**Version:** v1.1 – ENHANCED WITH DEDUCTIBILITY INSIGHTS & INCENTIVE PROFILE  
**Date:** January 12, 2026  
**Status:** FINAL – PRODUCTION READY  
**App Name:** MYAUDIT  
**Governance:** RPR-KONTROL v1.0  
**Infrastructure:** Firebase + Google Cloud (asia-southeast1 / Singapore)  
**Repository:** GitHub (Authoritative Global Record)  

---

## EXECUTIVE SUMMARY

**MYAUDIT** is a **revenue-generating child product** of RPR COMMUNICATIONS, LLC. It is a purpose-built SaaS-lite accounting engine designed to **replace in-house finance personnel** who manually compile bank statements and extract transactions for year-end audit submissions.

**New in v1.1: Intelligence Layer**  
Beyond basic extraction and audit readiness, MYAUDIT now includes a **Deductibility Insight Engine (DIE)** and **Incentive Profile** that detect misclassifications (e.g., Entertainment vs Staff Welfare) and surface industry-specific tax benefits—all delivered in plain language for non-finance SME owners.

**Core Value Proposition:**
- **For SMEs:** Eliminate manual bookkeeping; AI auto-extracts transactions AND flags misclassifications (e.g., 50% vs 100% deductibility).
- **For In-House Finance Teams:** Reduce compilation time from 40+ hours/year to <5 hours; improve classification accuracy.
- **For Auditors:** Receive pre-validated, document-linked ledger entries; reduce audit rework by ≥20%.
- **For Compliance:** Audit-ready records with immutable change logs, zero data gaps, and built-in incentive screening.

**Core Objective:**  
Convert chaotic bank statements into audit-ready financial records and finalized tax computations in **≤ 30 days** from initial entity setup, while flagging deductibility risks and eligible tax benefits.

**Geographic Scope:** Malaysia only (MY tax rules, MYR currency, LHDN authority)

**Key Constraints:**
- Country lock: Malaysia-only – no multi-country roadmap
- Languages: EN (English), BM (Bahasa Malaysia), ZH (Simplified Chinese)
- Infrastructure: asia-southeast1 (Singapore) – all data residency enforced
- Parent Organization: RPR COMMUNICATIONS, LLC
- Governance Framework: RPR-KONTROL v1.0 (escalation, audit, decision authority)

---

## 1. PRODUCT VISION & POSITIONING

### 1.1 What is MYAUDIT?

**MYAUDIT** is a four-stage, AI-driven accounting workflow engine that **replaces manual bank-to-ledger work** while **protecting against costly misclassifications**:

| Stage | Name | Function | Primary Actor |
|-------|------|----------|---|
| **Tab 1** | Entity Profile | Create company, set FY, select language, **profile incentive eligibility** | User (One-time setup) |
| **Tab 2** | Extraction | Upload bank statements, **AI auto-classifies** | AI (Gemini) + System |
| **Tab 3** | Refinement | Review flagged items, **attach docs, fix misclassifications**, audit-ready | User + **The Aoutha (AI)** |
| **Tab 4** | Tax Planning | Calculate LHDN tax, **apply incentives based on profile**, maximize benefits | AI (Gemini) + **Mr R.P.P (AI)** |

### 1.2 Problem Statement

Malaysian SMEs face four critical pain points:

1. **Manual Bookkeeping Overhead:** Bank statements → manual data entry → spreadsheets = 40+ hours per year per SME
2. **Audit Delays & Rework:** Auditors spend 30% of engagement time collecting missing docs and asking clarifications
3. **Human Error Risk:** Manual extraction → transcription errors → compliance gaps → LHDN scrutiny
4. **Misclassification & Lost Tax Benefits:** **NEW**: Bad advice from tax agents or simple confusion leads to:
   - Staff dinners coded as "Entertainment" (50% deductible) instead of "Staff Welfare" (100% deductible) → lost RM 50,000+ on RM 100,000 spend
   - Missed industry incentives (Automation CA, Reinvestment Allowance, disabled staff deductions, small value assets)
   - Overpayment of tax due to suboptimal classification or overlooked reliefs

**MYAUDIT Solves All Four:**
- ✅ **Automate extraction:** Gemini 2.0 Flash OCR extracts bank statements → 80–90% auto-classified
- ✅ **Minimize errors:** The Aoutha validates completeness, flags missing docs before auditor sees
- ✅ **Prepare audit-ready records:** Document linkage, immutable audit logs, ready to submit
- ✅ **NEW: Detect misclassifications & incentive gaps:** DIE flags Entertainment vs Staff Welfare; profiles unlock industry-specific tax benefits

### 1.3 Target Users

**Primary:**
- **Solo directors & small SMEs** (0–50 employees, <RM 10M turnover) who currently hire finance staff to compile accounts
- **In-house accountants/bookkeepers** who spend 40+ hours/year on manual bank-to-ledger entry AND struggle with classification accuracy
- **External auditors** (view-only, comment-enabled in Phase 2) who receive audit workpapers

**Secondary:**
- Tax advisors (Tab 4 only, advisory mode for tax optimization)
- RPR COMMUNICATIONS clients seeking audit acceleration service

**Industries:** Manufacturing, Services, Trading, Professional (Malaysia-centric)

**Out of Scope (v1):**
- Multi-entity consolidation
- Inventory/asset management
- Multi-year comparative analysis
- Cross-border FX or international tax

---

## 2. NEW IN v1.1: DEDUCTIBILITY INSIGHTS & INCENTIVE PROFILE

### 2.1 The Deductibility Insight Engine (DIE)

**Purpose:** Detect and prevent high-impact misclassifications that reduce allowable deductions or miss tax benefits.

**How it works:**
- Runs as a **heuristic layer** between `LedgerEntry` and `taxcompute.ts` (protected backend).
- Groups ledger entries by pattern (description, category, amount).
- Identifies **high-risk patterns** like:
  - Large "Entertainment" entries with keywords: "Annual Dinner", "Staff Trip", "Team Building", "Pantry Supplies" → suggests "Staff Welfare" (100% vs 50% deductible).
  - Capital assets miscoded as "Office Supplies" → suggests "Capital Assets" for allowance eligibility.
  - Unidentified large items → flags for clarification.
- **Never auto-changes** user's categorization; always asks for confirmation and supporting documents.
- Estimates directional tax impact ("50% vs 100% deductible") but leaves final computation to `taxcompute.ts`.

**Example scenario (RM 100k staff dinner):**
- User tags entries as "Entertainment" with description "Annual Staff Dinner".
- DIE detects the pattern + large amount.
- The Aoutha (Tab 3) prompts: "I see 'Annual Staff Dinner' tagged as Entertainment. If this was only for your staff, it may be eligible as Staff Welfare, giving you more tax savings. Who attended – only staff or clients too?"
- User answers "Staff only" and uploads staff list.
- DIE recalculates: "If classified as Staff Welfare, you can claim the full RM 100,000 instead of RM 50,000. This saves roughly RM 8,500 in tax (at 17% SME rate). Confirm this change?" [User confirms.]
- Status updates, DIE notifies Mr R.P.P in Tab 4 for final tax computation.

### 2.2 Incentive Profile Questionnaire (Tab 1 – NEW)

**Purpose:** Capture industry, activity, and profile signals early so Aoutha & Mr R.P.P can surface relevant tax benefits.

**Design principle:** Very simple language—assume non-finance SME owner.

**Questions (6–10, plain English, Yes/No or simple multiple choice):**

1. **What does your business mainly do?**
   - Manufacturing (machines, assembly, production)
   - Services (consulting, design, repair)
   - Trading / Retail / Wholesale
   - Professional (accounting, legal, medical)
   - Tech / Software / IT
   - Agriculture
   - Other

2. **Does your business buy new machines, equipment, or software to improve work or use AI/automation?**
   - Yes
   - No
   - Plan to in the next year
   *[Relates to: Automation Capital Allowance, digital incentives]*

3. **Does your business reinvest profits in upgrading factories or buildings?**
   - Yes, regularly
   - Yes, occasionally
   - No
   *[Relates to: Reinvestment Allowance for manufacturing/agriculture]*

4. **Do you employ anyone who is officially registered as disabled (Kad OKU)?**
   - Yes
   - No
   - Not sure
   *[Relates to: Double deduction on disabled staff salaries]*

5. **Do you often buy small items (each less than about RM 2,000) like tools, office equipment, or furniture?**
   - Yes, regularly
   - Yes, occasionally
   - No
   *[Relates to: Special allowance for small value assets]*

6. **Does your business hold Malaysia Digital / Pioneer status, or are you applying?**
   - Yes, we have it
   - No, but planning to apply
   - No, not relevant to us
   *[Relates to: Digital tax holidays / incentives]*

**Storage:** Add optional fields to `Entity` model:
```json
{
  "id": "ent_uuid",
  "name": "ABC Sdn Bhd",
  "mainActivity": "Manufacturing" | "Services" | "Trading" | "Professional" | "Tech" | "Agriculture" | "Other",
  "usesAutomation": true | false,
  "reinvestsInAssets": "regularly" | "occasionally" | "no",
  "employsDisabledStaff": true | false | "unsure",
  "frequentSmallAssets": "regularly" | "occasionally" | "no",
  "hasPioneerStatus": true | false | "applying",
  // ... existing fields ...
}
```

---

## 3. UPDATED FOUR-TAB WORKFLOW

### 3.1 Tab 1: Entity Profile (ENHANCED)

- User enters: Company name, reg no., industry, paid-up capital, SME flag
- **NEW: User completes Incentive Profile Questionnaire** (simple language)
- User selects: Country (Malaysia – read-only), Language (EN/BM/ZH)
- User sets: Financial Year End
- **Output:** Entity + FinancialYear records created; incentive profile stored for later recommendations.

### 3.2 Tab 2: Extraction (Bank → Logs)

- **User uploads bank statement (PDF/CSV)**
- **AI auto-classifies transactions** using Gemini 2.0 Flash
- Classifier assigns: High confidence (>85%) auto-locked, Medium (60–85%) pre-filled, Low (<60%) flagged by Aoutha
- Output: LedgerEntry records with status AUTO_TAGGED
- **No floating panel yet** – appears AFTER extraction completes

### 3.3 Tab 3: Refinement (Pre-Audit Workpaper + DIE)

- **The Aoutha floating sidebar appears here** (right side panel)
- **NEW: DIE layer runs** and detects:
  - Misclassification patterns (Entertainment vs Staff Welfare, etc.)
  - Missing documentation
  - Capital vs revenue coding errors
- User sees:
  - Ledger list with **low-confidence items and DIE-flagged entries highlighted**
  - Real-time checklist: "All categorized?" "High-value items have docs?" "Any misclassifications detected?"
  - **DIE-specific prompts:** "I see 'Annual Dinner' as Entertainment. This might be Staff Welfare (more tax savings). Who attended?"
  - Document gap alerts: "RM 85K purchase – missing invoice"
  - Risk scores: Unusual patterns
- User actions:
  - Re-categorize based on DIE suggestions (or ignore if confident)
  - Attach supporting documents
  - Mark as "Audit-Ready"
- **Checklist updates in real-time** as user reviews/uploads
- Output: LedgerEntry status → AUDIT_READY, Trial Balance generated, **DIE insights logged**

### 3.4 Tab 4: Tax Planning (LHDN Computation + Incentive Profile)

- **Mr R.P.P floating sidebar appears here** (right side panel)
- System auto-populates: Chargeable Income (from TB), **incorporates DIE adjustments** (reclassifications from Tab 3)
- User selects: SME status, applies optional deductions/reliefs
- **NEW: Based on Incentive Profile answers from Tab 1, Mr R.P.P highlights eligible benefits:**
  - Automation CA (if `usesAutomation = true` + capex entries present)
  - Reinvestment Allowance (if `reinvestsInAssets = regularly` + manufacturing)
  - Disabled staff deductions (if `employsDisabledStaff = true` + salary entries)
  - Small value assets special allowance (if `frequentSmallAssets = regularly`)
  - Digital incentives / pioneer status relief (if `hasPioneerStatus = true/applying`)
- System calculates:
  - Tiered rates (15%, 17%, 24%) → final tax payable
  - **Directional tax impact of DIE reclassifications** ("Staff Welfare classification saves RM 8,500")
  - Potential incentive benefit (e.g., "Automation CA could reduce taxable income by RM 50,000")
- **Mr R.P.P panel shows:**
  - SME eligibility explanation
  - **Suggested incentives matched to Incentive Profile** with "talking points" for tax agent
  - Estimated tax savings (directional, not final)
  - Tax risk warnings (high entertainment-to-revenue ratio, etc.)
  - Tax optimization tips
  - **Always: "Please confirm with your licensed tax agent before filing. This is planning guidance, not formal tax advice."**
- Output: TaxComputation record, ready for approval

---

## 4. AI AGENTS: THE AOUTHA & MR R.P.P (ENHANCED)

### 4.1 The Aoutha – Audit Readiness & Deductibility Agent (Tab 3)

**Location:** Floating sidebar (right side) on Tab 3

**What it does:**
- **Smart Checklist:** Dynamic checklist auto-updates as user reviews/uploads docs
- **DIE-flagged Misclassifications:** Detects patterns (Entertainment vs Staff Welfare, Capital vs Revenue, etc.)
  - "I noticed 'Annual Staff Dinner' (RM 100,000) under Entertainment. If this was only for your staff, it may qualify as Staff Welfare (100% deductible instead of 50%). Who attended?"
  - "This looks like office furniture. If each item is under RM 2,000, it may have special fast write-off rules. Do you have receipts?"
- **Documentation Checklists:** For each suggestion, provides clear doc requirements:
  - Staff Welfare: "Staff attendance list, internal email, or HR memo"
  - Client Entertainment: "Client name, meeting purpose, receipts"
  - Capital assets: "Invoice showing asset details and cost"
- **Risk Scoring:** Highlights unusual patterns, reconciliation issues
- **Conversational Prompts (Plain English):** "RM 85K supplies – missing invoice. Can you attach it or explain what it was for?"

**Language Requirement:** All prompts must be **very simple**, one idea per sentence, no jargon. Assume non-accountant user.

**Example messages (Tab 3 – The Aoutha):**

1. *Classification suggestion:*  
   "I see a big amount for 'Annual Staff Dinner' tagged as Entertainment. If only your staff went, it might be better as Staff Welfare. That could let you claim the full amount instead of only half. Can you tell me – was this just for staff, or did clients come too?"

2. *Documentation request:*  
   "To make sure this is safe as Staff Welfare, I need to see a staff list or an email about the event. Do you have a document like that?"

3. *Missed capitalization:*  
   "This is a new computer for RM 3,000. Machines and equipment like this usually get special write-off rules in tax. Let me check if it qualifies… It looks like it does. Make sure you keep the receipt."

4. *Small asset opportunity:*  
   "You bought RM 30 office supplies. If you have many small purchases like this, there's a special rule that lets you claim the full cost right away instead of spreading it over years. Good news!"

5. *Mixed event caution:*  
   "This lunch has both staff and a client name. Meals with a mix of people are trickier for tax. The safe way is to claim it as Entertainment (50%), unless the meeting notes show the main purpose was staff training. What was the meeting for?"

### 4.2 Mr R.P.P – Tax Planning & Incentive Agent (Tab 4)

**Location:** Floating sidebar (right side) on Tab 4

**What it does:**
- **DIE-aware computation:** Uses reclassifications from Tab 3 to update tax estimates
  - "Because we moved that staff dinner to Staff Welfare, you can now claim the full RM 100,000 instead of RM 50,000. This saves about RM 8,500 in tax."
- **Profile-matched incentive screening:** Based on Incentive Profile from Tab 1:
  - Automation CA: "You told us you buy automation tools. You have capex for software. You may be able to claim extra write-offs for automation – talk to your tax agent about Automation Capital Allowance."
  - Reinvestment Allowance: "You reinvest in machinery. Some of this might qualify for special allowances in tax, especially if it's for manufacturing."
  - Disabled staff: "You employ registered disabled staff. You might be able to claim their salaries twice for tax purposes (called a double deduction). Keep their OKU cards."
  - Small assets: "You buy lots of small items. Special rules let you claim the full cost right away for items under RM 2,000 each."
  - Digital / Pioneer: "You have Pioneer status. You may get relief on profits for the certified period. Check the terms."
- **SME Eligibility:** Confirms SME status, applies tiered rates (15% ≤ RM 150k, 17% RM 150k–600k, 24% >RM 600k)
- **Tax Simulator:** "What-if" scenarios – adjust income, apply reliefs, see tax impact (directional)
- **Tax Optimization Tips:** Risk warnings, carry-forward loss advice, incentive checklists
- **Compliance Reminders:** "Please keep all invoices and receipts for 7 years."

**Language Requirement:** Same as Aoutha – very simple, one-idea-per-sentence, no tax jargon.

**Example messages (Tab 4 – Mr R.P.P):**

1. *DIE reclassification impact:*  
   "Great news – because we moved the staff dinner to Staff Welfare, your tax bill is lower. Instead of claiming RM 50,000, you can claim RM 100,000. That saves you about RM 8,500 in tax. Nice!"

2. *Automation incentive (from profile):*  
   "You told us you use AI or automation tools in your business. There's a special tax break for companies like yours that invest in new machines or software for automation. It's called Automation Capital Allowance. Your tax agent can help you claim it. Keep all the invoices."

3. *Reinvestment Allowance (manufacturing):*  
   "Because you're in manufacturing and you reinvest in machinery, you might qualify for something called Reinvestment Allowance. This can save tax on profits from that investment. Ask your tax agent about it."

4. *Disabled staff double deduction:*  
   "You employ staff with disability. Good news – for staff who are officially registered as disabled (Kad OKU), you can claim their salaries twice for tax. This is a real tax saver. Make sure their OKU cards are on file."

5. *Small assets opportunity:*  
   "You buy lots of small equipment (under RM 2,000 each). There's a special rule that lets you claim the full cost right away, instead of spreading it over years. This saves tax faster. Keep the receipts."

6. *Risk warning:*  
   "Your entertainment spending is high compared to your sales. This sometimes triggers LHDN questions. Make sure every meal or event has a clear business reason written down – like who you met and why. Keep all receipts."

7. *Compliance reminder:*  
   "Keep all bank statements, invoices, receipts, and documents for 7 years. This protects you if LHDN asks questions."

8. *Disclaimer (every assistant message):*  
   "This is planning guidance based on general Malaysian tax rules. Please confirm with your licensed tax agent before you file. This tool does not replace professional tax advice."

---

## 5. DATA MODEL (FIRESTORE – EXTENDED)

```json
// Entity (EXTENDED with Incentive Profile)
{
  "id": "ent_uuid",
  "name": "ABC Sdn Bhd",
  "registrationNo": "12345-678-90",
  "country": "MY",
  "language": "EN" | "BM" | "ZH",
  "industry": "Manufacturing",
  "smeFlag": true,
  "paidUpCapital": 500000,
  // NEW: Incentive Profile fields
  "mainActivity": "Manufacturing" | "Services" | "Trading" | "Professional" | "Tech" | "Agriculture" | "Other",
  "usesAutomation": true | false,
  "reinvestsInAssets": "regularly" | "occasionally" | "no",
  "employsDisabledStaff": true | false | "unsure",
  "frequentSmallAssets": "regularly" | "occasionally" | "no",
  "hasPioneerStatus": true | false | "applying",
  "incentiveProfileCompletedAt": 1705084800
}

// LedgerEntry (EXTENDED with DIE metadata)
{
  "id": "le_uuid",
  "transactionId": "txn_uuid",
  "yearId": "fy_uuid",
  "category": "Revenue/Sales" | "Utilities" | "Entertainment" | "Staff Welfare" | "Capital Assets" | "Uncategorized",
  "debit": 0,
  "credit": 1500.00,
  "status": "NEW" | "AUTO_TAGGED" | "USER_REVIEWED" | "AUDIT_READY" | "LOCKED",
  "supportingDocLinks": ["doc_uuid_1"],
  "auditNotes": "Invoice #INV-2025-001 attached",
  // NEW: DIE metadata
  "participantType": "STAFF_ONLY" | "CLIENT_ONLY" | "MIXED" | "UNIDENTIFIED" | null,
  "eventPurpose": "MARKETING" | "WELFARE" | "REVENUE_GENERATION" | "OTHER" | null,
  "sourceEvidence": ["Staff attendance list", "Internal memo", "Client meeting notes"] | null,
  "dieFlags": [
    {
      "flagType": "MISCLASSIFICATION_RISK",
      "suggestion": "Consider Staff Welfare instead of Entertainment",
      "estimatedImpact": "Could increase deductible amount from 50% to 100%",
      "confidence": 0.85,
      "createdAt": 1705084800
    }
  ]
}

// DIE Insight (new collection – audit trail of DIE suggestions)
{
  "id": "die_uuid",
  "ledgerEntryId": "le_uuid",
  "yearId": "fy_uuid",
  "flagType": "MISCLASSIFICATION_RISK" | "MISSING_DOC" | "CAPITAL_VS_REVENUE" | "OTHER",
  "originalCategory": "Entertainment",
  "suggestedCategory": "Staff Welfare",
  "rationale": "Keywords 'Annual Dinner' + staff-only participants suggest employee welfare",
  "estimatedTaxImpact": {
    "originalDeductibility": 0.5,
    "suggestedDeductibility": 1.0,
    "impactOnTaxAtRate17": 8500
  },
  "userResponse": "ACCEPTED" | "REJECTED" | "PENDING",
  "userResponseAt": 1705084800,
  "confidence": 0.85,
  "createdAt": 1705084800
}

// Rule Registry (backend-only, for Aoutha/Mr R.P.P to read)
{
  "id": "rule_uuid",
  "ruleId": "ENTERTAINMENT_VS_WELFARE",
  "ya": 2026,
  "type": "DEDUCTIBILITY_RULE" | "INCENTIVE",
  "industries": ["Manufacturing", "Services", "Trading", "Professional"],
  "effectiveFrom": "2026-01-01",
  "effectiveTo": "2026-12-31",
  "conditions": {
    "category": "Entertainment",
    "keywords": ["Annual Dinner", "Staff Trip", "Team Building", "Pantry"]
  },
  "descriptionSimpleEN": "If this event is only for your staff (not clients), it may count as Staff Welfare and be 100% deductible instead of 50% Entertainment.",
  "descriptionSimpleBM": "...",
  "riskLevel": "HIGH",
  "references": [
    "https://www.hasil.gov.my/.../PR_4_2015.pdf",
    "https://..."
  ]
}

// TrialBalance (unchanged)
// TaxComputation (unchanged but now incorporates DIE adjustments)
// AuditLog (unchanged, but now logs DIE decisions)
```

---

## 6. PROTECTED FILES (Zero-Overwrite Policy)

**These files require Founder approval before any changes:**

1. **backend/functions/src/visionengine.py**
   - Gemini 2.0 Flash OCR logic
   - Error topology, regional lock, forensic metadata

2. **backend/functions/src/classifier.ts**
   - Bank statement classification rules
   - Malaysian bank keyword mappings
   - Confidence scoring

3. **backend/functions/src/taxcompute.ts**
   - LHDN 2026 tax rates (15%, 17%, 24%)
   - SME eligibility logic
   - Incentive calculations
   - **Now incorporates DIE reclassifications**

4. **backend/functions/src/agents/aoutha.ts**
   - Audit checklist generation
   - **NEW: DIE pattern detection**
   - Document gap detection
   - Risk scoring

5. **backend/functions/src/agents/mr-rpp.ts**
   - Tax eligibility checker
   - **NEW: Incentive Profile matcher**
   - Incentive recommender
   - Tax simulator

**Note:** DIE logic (pattern matching, keyword detection, misclassification flagging) can live in **frontend heuristics** (`src/logic/riskHeuristics.ts`, `src/logic/auditReadiness.ts`) with the **backend agents reading Rule Registry** for authoritative definitions.

---

## 7. MULTI-LANGUAGE SUPPORT (EN / BM / ZH)

**All UI labels, prompts, checklists, and alerts translated to:**
- 🇬🇧 English (EN)
- 🇲🇾 Bahasa Malaysia (BM)
- 🇨🇳 Simplified Chinese (ZH)

**Structure for localization:**
- All Aoutha and Mr R.P.P prompts stored in a **message catalog** with keys like `MSG_ENTERTAINMENT_VS_WELFARE_EN`, `MSG_ENTERTAINMENT_VS_WELFARE_BM`, etc.
- Rule Registry `descriptionSimpleEN`, `descriptionSimpleBM`, `descriptionSimpleZH` fields.
- Frontend loads correct language based on `Entity.language`.

**NOT translated:**
- User-entered free text
- Bank transaction raw descriptions
- Dates (ISO 8601 format)

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### Performance Targets
- Tab 1 load: <2s
- Tab 1 Incentive Profile questionnaire: <1s (lightweight, client-side)
- Tab 2 extraction (500 transactions): <30s
- Tab 3 render with **DIE analysis** (1000 entries): <5s (includes pattern matching)
- Tab 4 tax compute with incentive matching: <3s
- Agent prompts: <5s
- Full FY lifecycle: <30 days

### Infrastructure
- **Hosting:** Firebase Hosting (asia-southeast1)
- **Database:** Firestore (asia-southeast1) with Rule Registry collection
- **Cloud Functions:** asia-southeast1 only
- **Data Residency:** Singapore exclusive
- **Backup:** Daily snapshots (7-year retention for audit logs, Rule Registry versions)

### Security
- **Authentication:** Firebase Auth
- **Authorization:** Role-based (Admin, Staff, Client, Auditor)
- **Encryption:** SSL/TLS in transit, Firestore default at rest
- **Audit Trail:** Immutable append-only logs for DIE decisions, classification changes, incentive recommendations
- **Rule Registry:** Backend-only; frontend accesses via secure API endpoint; no direct write from client

### Data Privacy
- **Personal Data:** Comply with Malaysia PDPA
- **Document Attachments:** Encrypted in Cloud Storage (asia-southeast1); linked to `LedgerEntry` via reference, not embedded
- **DIE Insights:** Stored as `DIEInsight` records for compliance audit; user can export or delete per request

---

## 9. GEMINI CONTROL DOCUMENTATION MANDATE (UPDATED)

**Gemini is responsible for producing comprehensive control documentation including:**

1. **Schema Design Document** – Firestore collections (including `DIEInsight`, Rule Registry), relationships, integrity constraints
2. **Classifier Rules Engine Specification** – Malaysian bank mappings, algorithm, confidence scoring
3. **Tax Computation Logic Specification** – 2026 LHDN rates, eligibility, incentives, reliefs, **DIE integration**
4. **The Aoutha Control Document (UPDATED)** – Checklist algorithm, **DIE pattern detection**, doc gap detection, risk scoring, **plain-English prompts** (EN, BM, ZH)
5. **Mr R.P.P Control Document (UPDATED)** – SME eligibility rules, **profile-matched incentive recommendation**, tax simulator, **plain-English prompts** (EN, BM, ZH)
6. **Deductibility Insight Engine Specification (NEW)** – Pattern matching algorithm, misclassification detection rules, DIE-to-agent integration, legal/ethical guardrails
7. **Incentive Profile Questionnaire Specification (NEW)** – Question design in plain language, response schema, profile field mapping, Rule Registry queries
8. **Error Handling & Forensic Metadata Specification** – Error topology, escalation triggers, audit logging (including DIE decisions)
9. **API Contract Specification** – HTTP endpoints, schemas, error codes, regional lock enforcement
10. **Security & Access Control Specification** – Firestore rules, auth flow, data residency, Rule Registry access control, secrets management
11. **Testing & Validation Specification** – Unit tests for DIE, golden datasets (including RM 100k staff dinner scenario), UAT checklists, benchmarks, plain-language prompt validation
12. **Deployment & CICD Specification** – Firebase strategy, Rule Registry versioning, environments, rollback, monitoring, rule update workflow

---

## 10. DEPLOYMENT READINESS

### Pre-Deployment Checklist
- [ ] `npm run lint` → 0 errors
- [ ] `npm run typecheck` → 100% type coverage
- [ ] All tests passing, **including DIE unit tests**
- [ ] Protected files untouched
- [ ] Regional lock verified (asia-southeast1)
- [ ] Secrets gitignored
- [ ] Git history clean
- [ ] **Rule Registry initialized with 2026 rules**
- [ ] **Aoutha & Mr R.P.P prompts localized to EN/BM/ZH**
- [ ] **DIE test scenarios passing (RM 100k staff dinner, mixed events, small assets, capital vs revenue)**
- [ ] Founder approval obtained

### Deployment Commands
```bash
# Backend
cd backend/functions && npm install && firebase deploy --only functions --region asia-southeast1

# Frontend (includes DIE + Incentive Profile)
cd frontend && npm install && npm run build && firebase deploy --only hosting

# Initialize Rule Registry (one-time)
firebase firestore:import --import-path=/path/to/rule-registry-backup.json

# Verify
firebase functions:list --region asia-southeast1
curl https://myaudit-prod.web.app
```

---

## 11. GOVERNANCE & APPROVAL

**Authority:** Founder puvansivanasan (sole ethical authority)

**Approval Gates:**
- Tax rate changes → Founder approval required (attach LHDN reference)
- New incentive rules → Founder approval required (attach MIDA/MDEC/LHDN reference)
- DIE pattern changes → Founder approval required (legal review for misclassification liability)
- New country/currency → Founder approval required
- Language additions → Founder approval required
- Security/compliance changes → Founder approval required

**Escalation:** Any AMBER/RED risk → escalation.service.ts → Founder notification

**Repository Authority:** GitHub main branch (hardening persisted, Founder signing)

**Rule Registry Updates:** Founder-approved changes logged with effective dates, versioned by YA (Year of Assessment)

---

## 12. REVISION HISTORY

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| v0.1 | 2026-01-12 | Functional Specification | Initial spec |
| v0.2 | 2026-01-12 | Spec + AI Agents + Design System | Added agent personas |
| v1.0 | 2026-01-12 | COMPLETE | Ready for build |
| **v1.1** | **2026-01-12** | **ENHANCED** | **Added DIE, Incentive Profile, plain-language prompts, Rule Registry, profile-matched incentive recommendations** |

---

## KEY TAKEAWAY

**MYAUDIT replaces in-house finance personnel who manually compile bank statements and extract transactions for audit submission.**

The AI (Gemini) does 80–90% of the work automatically. **The Aoutha validates, flags misclassifications, and prevents costly errors.** **Mr R.P.P surfaces industry-specific tax benefits based on the user's profile.** Output: audit-ready records + optimized tax plan in 30 days, all delivered in simple language that a non-accountant SME owner can understand and act on.

**Secret sauce:** DIE detects misclassifications (Entertainment vs Staff Welfare, etc.) before they cost money. Incentive Profile ensures no tax breaks are left on the table. Both are secured, auditable, and compliant with Malaysian law.

---

**App Name:** MYAUDIT  
**Version:** v1.1 – ENHANCED  
**Status:** FINAL – READY FOR GEMINI IMPLEMENTATION  
**Authority:** Founder puvansivanasan  
**Document Classification:** AUTHORITATIVE SPECIFICATION  
**Last Updated:** 2026-01-12 22:30 UTC+8
