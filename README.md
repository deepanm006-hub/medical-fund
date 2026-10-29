# MedicalFund 🩺❤️

> A transparent, verified medical crowdfunding & patient relief platform dedicated strictly to healthcare emergencies, critical surgeries, and life-saving treatments.

---

## ✨ Full Feature Overview

- **🛡️ 100% Medical & Hospital Verification Framework**:
  - Direct hospital disbursement guarantees with anti-diversion protocols.
  - Verification badges for doctor prescriptions, diagnostic reports, and ICU estimates.
  - Official hospital quota reference codes (`FEHI-9942`, `MSK-HEM-991204`, etc.).
- **⚡ Emergency / Urgent Spotlights**:
  - Live urgency badges with countdown timers (e.g. *Surgery in 48 hours*).
  - Dedicated Emergency Section for critical trauma and surgery cases.
- **🔍 Multi-Dimensional Exploration**:
  - Instant live search across patient names, diagnoses, hospitals, and cities.
  - Specialty category filters: *Pediatric Cardiac, Cancer Care, Accident & Trauma, Organ Transplant, Rare Diseases*.
  - Flexible sorting: *Urgency, Most Funded, Goal: Low to High, Goal: High to Low, Recently Added*.
- **🗂️ 5-Tab Deep Clinical Campaign View**:
  - **Tab 1: Story & Diagnosis**: Detailed patient history, attending surgeon, and cost allocation breakdown.
  - **Tab 2: Verified Medical Documents**: One-click inspection of official hospital estimate letters and diagnostic reports.
  - **Tab 3: Recovery Timeline**: Chronological log of surgeries, ICU milestones, and patient recovery notes.
  - **Tab 4: Hospital Payouts Ledger**: Itemized disbursement tranches wired directly to verified hospital accounts with bank references and wire UTR codes.
  - **Tab 5: Donors & Encouragement Messages**: Public community support board.
- **💳 Multi-Gateway Payment Simulation**:
  - **Credit / Debit Cards**: Interactive card input and formatting.
  - **UPI / QR Code**: Dynamic QR code simulation with support for GPay, PhonePe, and Paytm.
  - **Digital Wallets**: Apple Pay & Google Pay 1-tap checkout.
  - 3-phase animated processing simulation: *SSL Connection > Escrow Verification > Tax Receipt Clearance*.
- **📄 Instant 80G / 501(c)(3) Tax Exemption Receipts**:
  - Printable / PDF-ready official digital tax exemption receipts with unique transaction IDs stored locally in **"My Receipts"**.
- **🏥 Partner Hospital Network Directory**:
  - Accredited clinical centers (Fortis, Memorial Sloan Kettering, Children's National, Medanta, St. Jude).
  - Bed quotas, ICU capacity metrics, and hospital onboarding application form.
- **👥 Role Switcher**:
  - Easily toggle views between **Donor**, **Hospital Auditor**, and **Patient Family**.
- **🔖 Saved Cases (Bookmarks)**:
  - Follow individual patient recoveries and access them quickly from the header.
- **🔗 Compassionate Social Sharing**:
  - 1-click clipboard copy of pre-formatted campaign appeals.
- **📝 Multi-Step "Start a Fundraiser" Wizard**:
  - Step 1: Patient details & diagnosis.
  - Step 2: Hospital details, target goal, and urgency indicator.
  - Step 3: Story, photo, and instant live publication.

---

## 🗂️ Project Structure

```text
medical-fund/
├── index.html         # Main web application & interactive UI
├── css/
│   └── styles.css     # Custom animations, glassmorphism, progress bars & print styles
├── js/
│   ├── data.js        # Seed campaigns, clinical conditions, hospital partners & exchange rates
│   ├── storage.js     # LocalStorage state management for campaigns, donations, receipts & hospital apps
│   └── app.js         # Core application controller, payment gateway, auditor portal & modal wizards
├── .gitignore         # Clean repository ignore patterns
└── README.md          # Comprehensive documentation
```

---

## 🚀 Running Locally

Simply open [`index.html`](index.html) in your browser:
```powershell
Start-Process "index.html"
```
Or start a local web server:
```bash
python -m http.server 8000
```

---

## 📤 Pushing Changes to GitHub

To push your latest commits to [`deepanm006-hub/medical-fund`](https://github.com/deepanm006-hub/medical-fund.git):

1. **If using GitHub CLI (`gh`)**:
   ```powershell
   gh auth login
   git push origin main
   ```

2. **Or with a Personal Access Token (PAT)**:
   ```powershell
   git push https://<YOUR_GITHUB_TOKEN>@github.com/deepanm006-hub/medical-fund.git main
   ```
