# PRD: MYAUDIT v1.2 – CLOUD-BASED AI ACCOUNTING & TAX AUTOMATION SYSTEM

## Product Requirement Document – Malaysian SME Mass-Market SaaS Edition

**Version:** v1.2 – Repositioned for Automation Capital Allowance & Industry 4.0 Narrative  
**Date:** January 13, 2026  
**Status:** PRODUCTION READY  
**Product Name:** MYAUDIT  
**Tagline:** Cloud-based AI accounting & tax automation system for Malaysian SMEs  
**Governance:** RPR-KONTROL v1.0  
**Infrastructure:** Google Cloud exclusively (Firebase, asia-southeast1 / Singapore region)  
**Repository:** GitHub (Authoritative global record)  
**Commercial Model:** SaaS subscription (monthly/annual) with optional onboarding  
**Target Market:** Malaysian SMEs (0–50 employees, <RM 10M turnover)  

---

## EXECUTIVE SUMMARY

**MYAUDIT** is a **revenue-generating SaaS product** designed as a mass-market alternative to manual accounting and fragmented tax planning tools. Built on Google Cloud's AI and automation infrastructure, it is positioned as an **Industry 4.0 digital solution** that qualifies for Malaysia's **Automation Capital Allowance** incentives.

### What MYAUDIT Does

MYAUDIT automates the complete **bank-to-tax** workflow for Malaysian SMEs:

1. **Extraction** – AI auto-extracts bank statements and classifies transactions
2. **Audit Readiness** – Validates completeness, flags risks, links supporting documents
3. **Tax Planning** – Computes LHDN tax and surfaces eligible incentives (Automation CA, Reinvestment Allowance, Disabled Staff Deductions, etc.)
4. **Intelligent Refinement** – AI agents detect misclassifications (e.g., Entertainment vs Staff Welfare) and prevent costly tax compliance errors

### Why MYAUDIT Matters

- **For SMEs:** Eliminate 40+ hours/year of manual bookkeeping; understand tax benefits in plain language
- **For Finance Teams:** Reduce compilation time from 40+ hours to <5 hours; improve classification accuracy
- **For Auditors:** Receive pre-validated, document-linked, audit-ready ledger entries
- **For Compliance:** Immutable audit logs, zero data gaps, automated risk flagging
- **For Government Incentive Programs:** Qualifies as an **AI/cloud automation system** for Automation CA and digital transformation narratives

### Product Positioning

> **MYAUDIT is the only cloud-based AI accounting & tax automation system built exclusively on Google Cloud for Malaysian SMEs, designed to pass LHDN audits and support Automation Capital Allowance / Industry 4.0 incentive applications.**

### Core Metrics (Post-Launch)

- **Extraction accuracy:** 85–95% auto-classification on first pass
- **Audit readiness:** 0 data gaps, 100% document linkage
- **Time savings:** 40+ hours → <5 hours per year
- **Tax optimization:** Identify ≥2 eligible incentives per SME; average tax savings RM 5,000–50,000 per client per year
- **Geographic scope:** Malaysia only; singapore data residency enforced

---

## 1. PRODUCT VISION & POSITIONING

### 1.1 Industry 4.0 & Automation Capital Allowance Alignment

**MYAUDIT is built to fit Malaysia's government's own digital transformation narrative:**

MYAUDIT qualifies as an **Industry 4.0 automation & AI system** under MIDA's Automation Capital Allowance (Automation CA) guidelines:

- **Cloud-based:** Hosted on Google Cloud (asia-southeast1 / Singapore), no on-premise lock-in
- **AI-powered:** Generative AI (Gemini 2.0) + rule-based agents (The Aoutha, Mr R.P.P) automate core accounting workflows
- **Productivity automation:** Replaces 40+ manual hours/year, reduces human error, improves SME financial agility
- **Audit & compliance:** Immutable logs, document linkage, and automated risk detection align with governance expectations

**SMEs using MYAUDIT can include their subscription/implementation costs in Automation Capital Allowance applications**, subject to MIDA/SIRIM approval, positioning MYAUDIT as a **digital transformation enabler**, not just a tool.

### 1.2 Four-Tab Workflow Architecture

| **Tab** | **Stage** | **Function** | **Primary AI/Agent** | **Outcome** |
|---------|-----------|-------------|----------------------|------------|
| **1** | Entity Profile | Create company, set FYE, select language, answer Incentive Profile questionnaire | System + User | Establishes eligible incentive signals for Tabs 2–4 |
| **2** | Extraction | Upload bank statements → AI auto-classifies transactions → highlights ambiguities | Gemini 2.0 (OCR, classification) | 85–95% auto-classified ledger; flagged items ready for review |
| **3** | Refinement | Review flagged items, attach docs, fix misclassifications, validate audit readiness | The Aoutha (audit agent) + DIE (Deductibility Insight Engine) | Audit-ready ledger with 0 gaps, 100% doc linkage, risk flags |
| **4** | Tax Planning | Compute LHDN tax, apply incentives from Incentive Profile, maximize tax benefits | Mr R.P.P (tax agent) + RuleRegistry | Final tax computation with Automation CA / incentive suggestions |

### 1.3 Problem MYAUDIT Solves

**For Malaysian SMEs:**

1. **Manual accounting overhead** – Bank statements → manual data entry → spreadsheets = 40+ hours/year
2. **Audit friction** – Auditors spend 30%+ of engagement time collecting missing docs and fixing errors
3. **Human error risk** – Manual entry → transcription errors → compliance gaps → LHDN scrutiny
4. **Missed tax incentives & misclassifications:**
   - Staff dinner coded as "Entertainment" (50% deductible) instead of "Staff Welfare" (100% deductible) → lost RM 8,500 on RM 100k spend
   - Overlooked Automation CA on software/AI investments
   - Missed Reinvestment Allowance on equipment purchases
   - Undetected disabled staff salary deductions
   - Suboptimal small-value asset treatment

**MYAUDIT solves all four by automating extraction, validation, and incentive discovery.**

### 1.4 Target Users

**Primary:**
- Solo directors and small SMEs (0–50 employees, <RM 10M turnover) currently hiring finance staff for year-end compilation
- In-house accountants/bookkeepers spending 40+ hours/year on bank-to-ledger work
- Finance managers in manufacturing, services, trading, professional sectors

**Secondary:**
- Tax advisors (optional integration for Tab 4 advisory mode)
- External auditors (Phase 2: view-only, comment-enabled access)
- RPR COMMUNICATIONS clients

**Out of Scope (v1):**
- Multi-entity consolidation
- Inventory/asset management
- Multi-year comparative analysis
- International tax or cross-border FX

---

## 2. CORE FEATURES & INTELLIGENCE LAYER

### 2.1 Extraction (Tab 2) – Gemini 2.0 Flash OCR + Classification

**Input:** PDF bank statements (e.g., Maybank, RHB, CIMB, Bank Muamalat)

**Process:**
1. Upload bank statements (single or bulk)
2. Gemini 2.0 Flash extracts:
   - Date, amount, description, running balance
3. System classifies each transaction:
   - Revenue vs Expense vs Transfer
   - Category (Travel, Supplies, Payroll, etc.) based on description heuristics
   - Confidence score (High, Medium, Low)
4. Return 85–95% auto-classified ledger with flagged items for review

**Output:** LedgerEntry objects with:
- Transaction date, amount, description, classification, confidence, supporting doc URL (placeholder for user to attach)

### 2.2 The Aoutha – Audit Readiness Agent (Tab 3)

**Role:** Validates ledger completeness, flags missing docs, detects audit red flags

**Capabilities:**
- Counts total entries, identifies gaps by date range
- Flags large transactions without supporting documents
- Detects potential employment compliance risks (EPF/SOCSO/EIS consistency with payroll)
- Alerts on transactions that don't match typical pattern (anomalies)
- Ensures every entry has a document link before "Audit Ready" status

**Output:** Audit readiness score, list of missing docs, compliance risk flags, next steps for user

### 2.3 Deductibility Insight Engine (DIE) – Smart Misclassification Detection

**Purpose:** Prevent costly misclassifications by detecting patterns that indicate deductibility risk or tax benefit opportunity.

**Examples:**
- "Annual Dinner" + "Staff Trip" + "Team Building" + large amount → suggests Staff Welfare (100% deductible vs 50% for Entertainment)
- Capital equipment miscoded as "Office Supplies" → suggests Capital Asset treatment for allowance eligibility
- Unidentified large vendor payments → flags for clarification
- Multiple small equipment purchases → suggests Small Value Asset allowance

**Process:**
- Runs as heuristic layer during Tab 3 refinement
- Never auto-changes user classification; always prompts for confirmation
- Calculates directional tax impact ("Reclassifying to Staff Welfare could save RM 8,500 in tax")
- Links back to Rule Registry for final computation

### 2.4 Mr R.P.P – Tax Planning Agent (Tab 4)

**Role:** Computes LHDN tax, surfaces eligible incentives, maximizes tax benefits

**Capabilities:**
- Applies current LHDN tax rules (YA 2026: 15% pioneer, 17% SME, 24% standard rate + cess)
- Queries RuleRegistry for eligible incentives based on Incentive Profile answers
- Calculates potential tax savings for each incentive (Automation CA, Reinvestment Allowance, Disabled Staff Deductions, Small Value Assets, etc.)
- Presents recommendations in plain language with advisory disclaimers
- Outputs final tax computation with doc linkage

**Output:** Tax computation summary with incentive suggestions, estimated tax liability, filing deadline (LHDN Form C, 7 months from FYE)

### 2.5 Incentive Profile Questionnaire (Tab 1)

**Purpose:** Capture business profile early so DIE and Mr R.P.P can surface relevant incentives

**Questions (Simple, Plain English):**

1. **What does your business mainly do?**
   - Manufacturing (machines, assembly, production)
   - Services (consulting, design, repair, IT)
   - Trading / Retail / Wholesale
   - Professional (accounting, legal, medical)
   - Other

2. **Do you buy new machines, equipment, or software to improve work or use AI/automation?**
   - Yes
   - No
   - Plan to in the next year
   *[Signals eligibility for Automation Capital Allowance]*

3. **Do you reinvest profits in upgrading factories or buildings?**
   - Yes, regularly
   - Yes, occasionally
   - No
   *[Signals eligibility for Reinvestment Allowance]*

4. **Do you employ anyone with official disability (Kad OKU)?**
   - Yes
   - No
   - Not sure
   *[Signals eligibility for disabled staff salary double deduction]*

5. **Do you often buy small items (each <RM 2,000) like tools or equipment?**
   - Yes, regularly
   - Yes, occasionally
   - No
   *[Signals eligibility for Small Value Asset allowance]*

6. **Is your business in a priority sector (agriculture, renewable energy, digital tech)?**
   - Yes
   - No
   *[Signals eligibility for pioneer relief or sector-specific incentives]*

---

## 3. AUTOMATION CAPITAL ALLOWANCE & INDUSTRY 4.0 POSITIONING

### 3.1 Why MYAUDIT Supports Automation CA Applications

**Automation Capital Allowance (2023–2027)** allows qualifying companies to claim **200% capital allowance** on eligible automation/AI investments.

**MYAUDIT qualifies as an Industry 4.0 digital solution because:**

1. **Cloud-based infrastructure** – Hosted on Google Cloud (asia-southeast1), not on-premise
2. **AI automation** – Generative AI (Gemini) + rule-based agents automate core workflows
3. **Productivity improvement** – Replaces 40+ manual hours/year, reduces errors, enables SME agility
4. **Digital transformation narrative** – Aligns with MIDA's Industry 4.0 and Government 4.0 objectives

**For SMEs using MYAUDIT:**

- Their subscription and implementation costs may be included in Automation CA applications (subject to MIDA/SIRIM approval)
- MYAUDIT provides documentation of AI/automation capabilities for audit evidence
- Positions the SME as digitally transformed and compliant with Industry 4.0 expectations

### 3.2 MYAUDIT as SME Support for Automation CA Narrative

**In Tab 4 (Tax Planning), Mr R.P.P will surface:**

> "Based on your use of AI/cloud automation software (MYAUDIT) and other digital tools, you may be eligible for **Automation Capital Allowance (200% on qualifying spend)** under MIDA's Industry 4.0 incentives. This could apply to your software licenses, implementation costs, and any related cloud infrastructure. 
>
> **Next step:** Consult your tax advisor or apply directly to MIDA/SIRIM with documentation of your digital transformation investments. MYAUDIT's audit trail and usage logs can support your application."

### 3.3 RuleRegistry Configuration for Automation CA

**RuleRegistry entries for Automation CA (YA 2026):**

```json
{
  "id": "AC_AUTO_CA_2026",
  "name": "Automation Capital Allowance",
  "category": "incentive",
  "applicableYears": ["YA2026"],
  "criterion": {
    "condition": "Q2_automation_equipment_software == 'Yes' || Q2_automation_equipment_software == 'Plan to in the next year'",
    "description": "Business invests in AI/automation/Industry 4.0 equipment or software"
  },
  "benefit": {
    "type": "allowance",
    "rate": 200,
    "base": "capital_expenditure",
    "cap": 10000000,
    "description": "200% capital allowance on qualifying automation investments"
  },
  "statutoryRef": "MIDA Automation CA Guidelines (2024), Section IA ITA 1967",
  "advisory": true,
  "disclaimerText": "Eligibility depends on MIDA/SIRIM approval. MYAUDIT can support your application with documentation, but final determination rests with MIDA."
}
```

---

## 4. TECHNOLOGY & INFRASTRUCTURE

### 4.1 Google Cloud-First Architecture

**MYAUDIT is built exclusively on Google Cloud** to ensure:

1. **Data residency compliance** – All data stored in asia-southeast1 (Singapore) per PDPA/Malaysia regulations
2. **Security & scalability** – Google Cloud's enterprise-grade infrastructure, compliance certifications (ISO 27001, SOC 2)
3. **AI-first design** – Native Gemini API, Vertex AI, BigQuery for analytics
4. **Vendor lock-in (intentional)** – Only deployable on Google Cloud; no cross-cloud portability

**Tech Stack:**

- **Frontend:** Vite (React), TypeScript, Tailwind CSS
- **Backend:** Cloud Functions (TypeScript), Firestore, Cloud Storage
- **AI:** Gemini 2.0 Flash (text, vision), Vertex AI Agents
- **Auth:** Firebase Authentication, Google Identity Platform
- **Hosting:** Firebase Hosting (asia-southeast1)
- **Monitoring:** Cloud Logging, Cloud Trace, Cloud Profiler

### 4.2 Protected Files & Governance

**Protected from modification without Founder approval:**

- `visionengine.py` – Gemini-powered document extraction logic
- `classifier.ts` – Transaction classification heuristics
- `taxcompute.ts` – LHDN tax computation and rule application
- `agents/aoutha.ts` – Audit readiness logic
- `agents/mr-rpp.ts` – Tax planning & incentive logic

**Protected governance:**

- All updates to tax rules (RuleRegistry) require statutory reference + Founder approval
- No multi-country expansion without explicit directive
- Data residency: asia-southeast1 only; no regional failover or multi-region
- Advisory posture: Every incentive / tax suggestion marked as "subject to professional verification"

---

## 5. REVENUE MODEL & GO-TO-MARKET

### 5.1 SaaS Subscription (Primary Revenue)

**Pricing Tiers (to be finalized post-launch):**

1. **Starter (Monthly):** RM 99–199
   - Up to 5 entities
   - Basic extraction & extraction-only access
   - Community email support

2. **Professional (Monthly):** RM 299–499
   - Unlimited entities
   - Full 4-tab workflow (Extraction → Refinement → Tax Planning)
   - Priority email/chat support
   - Audit readiness reports

3. **Enterprise (Annual):** Custom
   - Dedicated account manager
   - Bulk entity licensing
   - API access for integrations
   - Custom RuleRegistry configuration

### 5.2 Optional Services (Secondary Revenue)

- **Onboarding & training:** RM 500–2,000 per SME
- **Tax filing documentation:** RM 300–1,000 per entity per year
- **Audit support:** RM 1,000–5,000 per engagement

### 5.3 GTM Strategy

**Phase 1 (Launch):** Partner with:
- Accounting firms (white-label for their SME clients)
- Tax advisors (Tab 4 integration, advisory mode)
- Google Cloud partners in Malaysia (co-marketing)

**Phase 2 (Growth):** Direct SME acquisition via:
- Google Ads (keywords: "AI accounting Malaysia", "SME tax help", "audit automation")
- Content marketing (LHDN rules, tax tips, Automation CA guides)
- SME associations, chambers of commerce

**Phase 3 (Scale):** Expand to:
- Government incentive platforms (MIDA self-service portal integration)
- Banking partnerships (bundled with SME lending)

---

## 6. SUCCESS METRICS

### 6.1 Product Metrics

- **Extraction accuracy:** ≥85% auto-classification on first pass
- **Audit readiness:** 0 data gaps, 100% document linkage
- **Time saved:** 40+ hours → <5 hours per entity per year
- **Incentive discovery:** ≥2 eligible incentives identified per SME
- **Average tax savings:** RM 5,000–50,000 per client per year

### 6.2 Business Metrics

- **User acquisition:** 100 SMEs by Month 3, 1,000 by Month 12
- **Monthly recurring revenue (MRR):** RM 10k by Month 6, RM 50k by Month 12
- **Churn rate:** <5% per month
- **Net Promoter Score (NPS):** ≥60 by Month 6
- **Customer satisfaction:** ≥4.5/5 stars (Trustpilot, G2)

### 6.3 Governance & Compliance Metrics

- **Zero LHDN audit failures** due to MYAUDIT data
- **100% data residency compliance** (asia-southeast1 only)
- **Zero unplanned downtime** (99.95% SLA)
- **Audit trail completeness:** All transactions, changes, user actions logged and immutable

---

## 7. ROADMAP

### v1.2 (Live, January 2026)
- ✅ Four-tab workflow (Extraction → Refinement → Tax Planning)
- ✅ The Aoutha agent (audit readiness)
- ✅ Mr R.P.P agent (tax planning)
- ✅ DIE (Deductibility Insight Engine)
- ✅ Incentive Profile & RuleRegistry
- ✅ Automation CA positioning & references

### v1.3 (Q1 2026)
- Auditor portal (view-only, comment-enabled)
- Bulk entity management for accounting firms
- Enhanced Automation CA documentation builder

### v2.0 (H2 2026)
- Tax filing integration (Form C submission readiness)
- LHDN e-invoice / SST alignment
- Government incentive platform API integrations (MIDA, SIRIM)

---

## 8. COMPLIANCE & LEGAL

### 8.1 Geographic & Regulatory Constraints

- **Country:** Malaysia only
- **Languages:** English (EN), Bahasa Malaysia (BM), Simplified Chinese (ZH)
- **Data residency:** asia-southeast1 (Singapore) – no exceptions
- **Tax authority:** LHDN (Hasil Dalam Negeri Malaysia)
- **Incentive authority:** MIDA (Malaysian Investment Development Authority) + SIRIM for Automation CA

### 8.2 Advisory Disclaimers

**Every tax and incentive suggestion in MYAUDIT includes the disclaimer:**

> "This is advisory information only and does not constitute professional tax or legal advice. Please consult a qualified tax advisor or chartered accountant before making final tax decisions or submitting forms to LHDN."

### 8.3 Data Protection

- **Compliance:** PDPA (Personal Data Protection Act 2010), LHDN data security requirements
- **Audit trail:** Every transaction, change, and user action logged immutably
- **Encryption:** AES-256 for data at rest, TLS 1.3 for data in transit
- **Backup:** Daily incremental + weekly full backups in asia-southeast1

---

## 9. STAKEHOLDER RESPONSIBILITIES

### Founder (Sole Authority)

- Final approval for all tax logic changes
- Strategic direction (pricing, markets, features)
- Governance escalations and ethical decisions
- Go-live and public announcement

### Product Team (Perplexity Command + Agents)

- Requirement gathering, wireframes, user flows (Perplexity)
- UI/UX implementation (Stitch, WebStorm, Gemini-FB)
- Backend logic, APIs, database (Gemini-AI, Cursor)
- Testing, integration, deployment (Antigravity, GitHub Actions)

### Tax & Compliance (External)

- Quarterly rule review (LHDN updates, incentive changes)
- MIDA/SIRIM liaison (Automation CA documentation)
- Audit support (if requested by users)

---

## 10. APPENDIX: KEY DEFINITIONS

| Term | Definition |
|------|-----------|
| **DIE** | Deductibility Insight Engine – heuristic layer detecting misclassifications |
| **Automation CA** | Automation Capital Allowance – 200% allowance on Industry 4.0 investments |
| **The Aoutha** | Audit readiness agent – validates completeness, flags risks |
| **Mr R.P.P** | Tax planning agent – computes LHDN tax, surfaces incentives |
| **RuleRegistry** | Configuration database storing LHDN rules, incentive conditions, statutory references |
| **Asia-southeast1** | Google Cloud region in Singapore; only deployment region for MYAUDIT |
| **LHDN** | Hasil Dalam Negeri Malaysia (Inland Revenue Board) |
| **MIDA** | Malaysian Investment Development Authority |
| **Industry 4.0** | Fourth Industrial Revolution – AI, cloud, automation, big data, IoT |
| **PDPA** | Personal Data Protection Act 2010 (Malaysia) |
| **Incentive Profile** | Tab 1 questionnaire capturing business sector, activity, eligibility signals |

---

## SIGN-OFF

**Document Owner:** Founder  
**Last Updated:** January 13, 2026  
**Status:** PRODUCTION READY  
**Version:** v1.2 – Repositioned for Automation Capital Allowance & Industry 4.0  
**Next Review:** LHDN Budget 2027 updates (Q4 2026)

