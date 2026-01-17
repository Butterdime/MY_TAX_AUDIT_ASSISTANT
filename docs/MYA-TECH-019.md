# MYA-TECH-019 – MYAUDIT Document Controller Setup

**Classification:** TS-Λ3 (CROWN SECRET)  
**Authority:** RPR-KONTROL v1.0 / SENTINEL PROTOCOL v1.1.0  
**Status:** SUBSTRATE ACTIVE (Healthy Harbor Established)

## Objective

Establish the primary, high-level control substrate for the MYAUDIT project under the RPR-COMMUNICATIONS-LLC legal entity.

## 1. Sovereign Infrastructure Registry (Verified)

| Layer | Identifier | Status |
|-------|------------|--------|
| Project Name | RPR-MYAUDIT | ACTIVE |
| Project ID | rpr-myaudit | ACTIVE |
| Project Number | 796960601918 | VERIFIED |
| Org Parent | 566551209016 (butterdime.com) | VERIFIED |
| Data Plane | asia-southeast1 (Singapore) | LOCKED |
| Billing | 019754-1D6DED-5ACC55 | LINKED & ACTIVE |

## 2. Governance Strategy: "Day 1 Compliance"

To ensure the "Healthy Harbor" remains unpolluted by legacy configuration errors (like the nam5 violation), all work within rpr-myaudit adheres to these defensive measures:

| Layer | Requirement | Action |
|-------|-------------|--------|
| Control Plane | Organization Parent | Confirm parent is 566551209016. |
| Data Plane | Regional Lock | MANDATORY: Firestore initialized in asia-southeast1 only. |
| Billing | Startup Credits | Project linked to the verified Startup Billing account. |

## 3. Hosting Configuration

The project supports multi-site hosting to separate the clinical app from the governance controller.

- **Primary App:** rpr-myaudit.web.app
- **Document Controller:** myaudit-kontrol.web.app (Site ID: myaudit-kontrol)

## 4. Startup Program Alignment

The control plane has been validated as "Startup-Ready." This substrate serves as the evidence base for the Google for Startups application, demonstrating organizational maturity and PDPA regulatory compliance via technical enforcement.

## Control Plane Verification Script

Before any infrastructure changes or Google for Startups credit applications, run the control plane verifier against the authoritative substrate.

Usage:

```bash
gcloud config set project rpr-myaudit
./scripts/verify-myaudit-control-plane.sh
```

The script checks:

- Organization parent is `566551209016` (butterdime.com).
- Firestore data residency is `asia-southeast1` (Singapore).
- Billing is enabled on `rpr-myaudit`.

All three statuses must be `OK`, and the script must print:

`✅ VERIFICATION SUCCESS: Substrate is Startup-Ready.`

---

**TS-Λ3 – CORE TRADE SECRET – RPR COMMUNICATIONS, LLC – Do Not Distribute.**
