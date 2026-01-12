# PRD: MYAUDIT v1.0 – COMPLETE
## Product Requirement Document for Malaysian SME Audit-Ready Accounting Engine

**Version:** v1.0 – AUTHORITATIVE SPECIFICATION  
**Date:** January 12, 2026  
**Status:** FINAL – READY FOR GEMINI CONTROL DOCUMENTATION  
**App Name:** MYAUDIT  
**Governance:** RPR-KONTROL v1.0  
**Infrastructure:** Firebase + Google Cloud (asia-southeast1 / Singapore)  
**Repository:** GitHub (Authoritative Global Record)  

---

## EXECUTIVE SUMMARY

**MYAUDIT** is a **revenue-generating child product** of RPR COMMUNICATIONS, LLC. It is a purpose-built SaaS-lite accounting engine designed to **replace in-house finance personnel** who manually compile bank statements and extract transactions for year-end audit submissions.

**Core Value Proposition:**
- **For SMEs:** Eliminate manual bookkeeping; AI auto-extracts transactions from bank statements in minutes
- **For In-House Finance Teams:** Reduce compilation time from 40+ hours/year to <5 hours
- **For Auditors:** Receive pre-validated, document-linked ledger entries; reduce audit rework by ≥20%
- **For Compliance:** Audit-ready records with immutable change logs, zero data gaps

**Core Objective:**
Convert chaotic bank statements into audit-ready financial records and finalized tax computations in **≤ 30 days** from initial entity setup.

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

**MYAUDIT** is a four-stage, AI-driven accounting workflow engine that **replaces manual bank-to-ledger work**:

| Stage | Name | Function | Primary Actor |
|-------|------|----------|----------------|
| **Tab 1** | Entity Profile | Create company, set FY, select language | User (One-time setup) |
| **Tab 2** | Extraction | Upload bank statements, **AI auto-classifies** | AI (Gemini) + System |
| **Tab 3** | Refinement | Review flagged items, attach docs, audit-ready | User + **The Aoutha (AI)** |
| **Tab 4** | Tax Planning | Calculate LHDN tax, apply incentives | AI (Gemini) + **Mr R.P.P (AI)** |

### 1.2 Problem Statement

Malaysian SMEs face three critical pain points:

1. **Manual Bookkeeping Overhead:** Bank statements → manual data entry → spreadsheets = 40+ hours per year per SME
2. **Audit Delays & Rework:** Auditors spend 30% of engagement time collecting missing docs and asking clarifications
3. **Human Error Risk:** Manual extraction → transcription errors → compliance gaps → LHDN scrutiny

**MYAUDIT Solves All Three:**
- ✅ **Automate extraction:** Gemini 2.0 Flash OCR extracts bank statements → 80–90% auto-classified
- ✅ **Minimize errors:** The Aoutha validates completeness, flags missing docs before auditor sees
- ✅ **Prepare audit-ready records:** Document linkage, immutable audit logs, ready to submit

### 1.3 Target Users

**Primary:**
- **Solo directors & small SMEs** (0–50 employees, <RM 10M turnover) who currently hire finance staff to compile accounts
- **In-house accountants/bookkeepers** who spend 40+ hours/year on manual bank-to-ledger entry
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

## 2. INFRASTRUCTURE & SOVEREIGN ALIGNMENT

### 2.1 Canonical Workspace Paths

| Component | Path | Authority | Status |
|-----------|------|-----------|--------|
| **Canonical SSD Root** | `/Users/puvansivanasan/PERPLEXITY-NEW/JOBS/2026-001-MYAUDIT` | 100% Source of Truth | ACTIVE |
| **GitHub Repository** | `https://github.com/RPR-COMMUNICATIONS-LLC/myaudit-engine` | Authoritative Global Record | NEW |
| **Firebase Project** | `myaudit-prod` (asia-southeast1) | Cloud Infrastructure | ACTIVE |
| **Google Drive Backup** | `/Users/puvansivanasan/Library/CloudStorage/.../MYAUDIT-BACKUP` | Historical Reference Only (NOT for active dev) | ARCHIVED |
| **Notion Master Index** | RPR-VERIFY Notion workspace | Project metadata sync | RETAINED |

### 2.2 Service Accounts & Infrastructure Topology

| Entity | Platform | Role | Authority |
|--------|----------|------|-----------|
| **Perplexity** | Perplexity AI | Architect – PRD ownership, mission briefs, governance | Strategic |
| **Gemini** | Google AI Studio | Engineer – schema, classifier, tax logic, agents, control docs | Technical |
| **Firebase Assistant** | Google Firebase Studio | Builder – UI, Firestore rules, hosting config, deployment | Tactical |
| **Jules** | GitHub Agent | CICD automation, deployment orchestration | Operational |
| **Cursor** | Cursor IDE | Local IDE edits, large-scale repo refactors | Tactical |

### 2.3 Regional Lock (asia-southeast1 / Singapore)

**LOCKED CONSTRAINT:**
- All Firebase services: Firestore, Hosting, Cloud Functions → asia-southeast1
- All Cloud Storage buckets → asia-southeast1
- Vertex AI (Gemini inference) → asia-southeast1
- Data residency: Singapore server exclusively; no cross-region replication
- Compliance: Malaysian PDPA alignment (personal data protection)

---

## 3. FOUR-TAB WORKFLOW (SIMPLIFIED)

### 3.1 Tab 1: Entity Profile
- User enters: Company name, reg no., industry, paid-up capital, SME flag
- User selects: **Country (Malaysia – read-only)**, **Language (EN/BM/ZH)**
- User sets: **Financial Year End**
- Output: Entity + FinancialYear records created

### 3.2 Tab 2: Extraction (Bank → Logs)
- **User uploads bank statement (PDF/CSV)**
- **AI auto-classifies transactions** using Gemini 2.0 Flash
- Classifier assigns:
  - **High confidence (>85%):** Auto-locked, user skips
  - **Medium (60–85%):** User reviews but pre-filled
  - **Low (<60%):** The Aoutha flags, user must decide
- Output: LedgerEntry records with status AUTO_TAGGED
- **No floating panel yet** – appears AFTER extraction completes

### 3.3 Tab 3: Refinement (Pre-Audit Workpaper)
- **The Aoutha floating sidebar appears here** (right side panel)
- User sees: Ledger list with low-confidence items flagged
- User actions:
  - Re-categorize Uncategorized items
  - Attach supporting documents (invoice, receipt, contract)
  - Mark as "Audit-Ready" (locks entry)
- **The Aoutha panel shows:**
  - Real-time checklist: "All categorized?" "High-value items have docs?" "TB balances?"
  - Document gap alerts: "RM 85K purchase – missing invoice"
  - Risk scores: Highlights unusual patterns
  - 1-line prompts: "Attach doc or re-categorize?"
- Checklist updates in real-time as user reviews/uploads
- Output: LedgerEntry status → AUDIT_READY, Trial Balance generated

### 3.4 Tab 4: Tax Planning (LHDN Computation)
- **Mr R.P.P floating sidebar appears here** (right side panel)
- System auto-populates: Chargeable Income (from TB)
- User selects: SME status, applies optional deductions/reliefs
- System calculates: Tiered rates (15%, 17%, 24%) → final tax payable
- **Mr R.P.P panel shows:**
  - SME eligibility explanation
  - Suggested incentives (Digital Transformation, R&D, Manufacturing, etc.)
  - Tax impact simulator ("What-if" analysis)
  - Tax optimization tips
- Output: TaxComputation record, ready for approval

---

## 4. AI AGENTS: THE AOUTHA & MR R.P.P

### 4.1 The Aoutha – Audit Readiness Agent (Tab 3)

**Location:** Floating sidebar (right side) on Tab 3

**When it appears:** After Tab 2 extraction completes (NOT on first upload)

**What it does:**
- **Smart Checklist:** Dynamic checklist that auto-updates as user reviews/uploads docs
- **Document Gap Detection:** Flags transactions missing supporting documents
- **Risk Scoring:** Highlights unusual patterns, reconciliation issues
- **Conversational Prompts:** "RM 85K supplies – missing invoice. Attach or re-categorize?"

### 4.2 Mr R.P.P – Tax Planning Agent (Tab 4)

**Location:** Floating sidebar (right side) on Tab 4

**What it does:**
- **SME Eligibility Checker:** Confirms SME status based on paid-up capital, income thresholds
- **Incentive Recommender:** Suggests applicable 2026 LHDN incentives with tax savings estimate
- **Tax Simulator:** "What-if" analysis – adjust income, apply reliefs, see tax impact
- **Tax Optimization Tips:** Risk warnings, carry-forward loss advice, incentive suggestions

---

## 5. DATA MODEL (FIRESTORE – CORE ENTITIES)

```json
// Entity
{
  "id": "ent_uuid",
  "name": "ABC Sdn Bhd",
  "registrationNo": "12345-678-90",
  "country": "MY",
  "language": "EN" | "BM" | "ZH",
  "industry": "Manufacturing",
  "smeFlag": true,
  "paidUpCapital": 500000
}

// BankStatement
{
  "id": "bs_uuid",
  "entityId": "ent_uuid",
  "yearId": "fy_uuid",
  "sourceBank": "CIMB" | "Maybank" | "RHB",
  "fileName": "CIMB_Statement_Jan2025.csv",
  "parsedStatus": "PENDING" | "SUCCESS" | "FAILED",
  "transactionCount": 47
}

// LedgerEntry (user-curated, audit-ready)
{
  "id": "le_uuid",
  "transactionId": "txn_uuid",
  "yearId": "fy_uuid",
  "category": "Revenue/Sales" | "Utilities" | "Payroll" | "Uncategorized",
  "debit": 0,
  "credit": 1500.00,
  "status": "NEW" | "AUTO_TAGGED" | "USER_REVIEWED" | "AUDIT_READY" | "LOCKED",
  "supportingDocLinks": ["doc_uuid_1"],
  "auditNotes": "Invoice #INV-2025-001 attached"
}

// TrialBalance (computed snapshot)
{
  "id": "tb_uuid",
  "yearId": "fy_uuid",
  "balances": [...],
  "balanced": true
}

// TaxComputation
{
  "id": "tax_uuid",
  "yearId": "fy_uuid",
  "chargeableIncome": 120000,
  "smeStatus": "ELIGIBLE" | "NOT_ELIGIBLE",
  "finalTaxPayable": 15750,
  "status": "DRAFT" | "APPROVED"
}

// AuditLog (immutable, append-only)
{
  "id": "audit_uuid",
  "timestamp": 1705084800,
  "action": "LEDGER_ENTRY_UPDATED" | "DOCUMENT_UPLOADED",
  "userId": "user_uuid",
  "oldValue": { "category": "Uncategorized" },
  "newValue": { "category": "Revenue/Sales" }
}
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

4. **backend/functions/src/agents/aoutha.ts**
   - Audit checklist generation
   - Document gap detection
   - Risk scoring

5. **backend/functions/src/agents/mr-rpp.ts**
   - Tax eligibility checker
   - Incentive recommender
   - Tax simulator

---

## 7. MULTI-LANGUAGE SUPPORT (EN / BM / ZH)

**All UI labels, prompts, checklists, and alerts translated to:**
- 🇬🇧 English (EN)
- 🇲🇾 Bahasa Malaysia (BM)
- 🇨🇳 Simplified Chinese (ZH)

**NOT translated:**
- User-entered free text
- Bank transaction raw descriptions
- Dates (ISO 8601 format)

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### Performance Targets
- Tab 1 load: <2s
- Tab 2 extraction (500 transactions): <30s
- Tab 3 render (1000 entries): <3s
- Tab 4 tax compute: <2s
- Agent prompts: <5s
- Full FY lifecycle: <30 days

### Infrastructure
- **Hosting:** Firebase Hosting (asia-southeast1)
- **Database:** Firestore (asia-southeast1)
- **Cloud Functions:** asia-southeast1 only
- **Data Residency:** Singapore exclusive
- **Backup:** Daily snapshots (7-year retention for audit logs)

### Security
- **Authentication:** Firebase Auth
- **Authorization:** Role-based (Admin, Staff, Client, Auditor)
- **Encryption:** SSL/TLS in transit, Firestore default at rest
- **Audit Trail:** Immutable append-only logs

---

## 9. GEMINI CONTROL DOCUMENTATION MANDATE

**Gemini is responsible for producing comprehensive control documentation including:**

1. **Schema Design Document** – Firestore collections, relationships, integrity constraints
2. **Classifier Rules Engine Specification** – Malaysian bank mappings, algorithm, confidence scoring
3. **Tax Computation Logic Specification** – 2026 LHDN rates, eligibility, incentives, reliefs
4. **The Aoutha Control Document** – Checklist algorithm, doc gap detection, risk scoring, prompts (EN/BM/ZH)
5. **Mr R.P.P Control Document** – SME eligibility rules, incentive recommendation, tax simulator, prompts (EN/BM/ZH)
6. **Error Handling & Forensic Metadata Specification** – Error topology, escalation triggers, audit logging
7. **API Contract Specification** – HTTP endpoints, schemas, error codes, regional lock enforcement
8. **Security & Access Control Specification** – Firestore rules, auth flow, data residency, secrets management
9. **Testing & Validation Specification** – Unit tests, golden datasets, UAT checklists, benchmarks
10. **Deployment & CICD Specification** – Firebase strategy, environments, rollback, monitoring

---

## 10. DEPLOYMENT READINESS

### Pre-Deployment Checklist
- [ ] `npm run lint` → 0 errors
- [ ] `npm run typecheck` → 100% type coverage
- [ ] All tests passing
- [ ] Protected files untouched
- [ ] Regional lock verified (asia-southeast1)
- [ ] Secrets gitignored
- [ ] Git history clean
- [ ] Founder approval obtained

### Deployment Commands
```bash
# Backend
cd backend/functions && npm install && firebase deploy --only functions --region asia-southeast1

# Frontend
cd frontend && npm install && npm run build && firebase deploy --only hosting

# Verify
firebase functions:list --region asia-southeast1
curl https://myaudit-prod.web.app
```

---

## 11. GOVERNANCE & APPROVAL

**Authority:** Founder puvansivanasan (sole ethical authority)

**Approval Gates:**
- Tax rate changes → Founder approval required (attach LHDN reference)
- New country/currency → Founder approval required
- Language additions → Founder approval required
- Security/compliance changes → Founder approval required

**Escalation:** Any AMBER/RED risk → escalation.service.ts → Founder notification

**Repository Authority:** GitHub main branch (hardening persisted, Founder signing)

---

## 12. REVISION HISTORY

| Version | Date | Status |
|---------|------|--------|
| v0.1 | 2026-01-12 | Functional Specification |
| v0.2 | 2026-01-12 | Spec + AI Agents + Design System |
| **v1.0** | **2026-01-12** | **COMPLETE – Ready for Gemini Control Documentation** |

---

## KEY TAKEAWAY

**MYAUDIT replaces in-house finance personnel who manually compile bank statements and extract transactions for audit submission.**

The AI (Gemini) does 80–90% of the work automatically. The Aoutha validates and flags gaps. Output: audit-ready records in 30 days.

---

**App Name:** MYAUDIT  
**Status:** FINAL – READY FOR GEMINI CONTROL DOCUMENTATION  
**Authority:** Founder puvansivanasan  
**Document Classification:** AUTHORITATIVE SPECIFICATION  
**Last Updated:** 2026-01-12 15:02 UTC+8
