# MedicalFund 🩺❤️

> A transparent, verified medical crowdfunding & patient relief platform dedicated strictly to healthcare emergencies, critical surgeries, and life-saving treatments.

---

## ✨ Features

- **🛡️ 100% Medical & Hospital Verification**:
  - Direct hospital disbursement guarantees.
  - Verification badges for doctor prescriptions, diagnostic reports, and ICU estimates.
  - Official hospital quota reference codes (`FEHI-9942`, `MSK-991204`, etc.).
- **⚡ Emergency / Urgent Spotlights**:
  - Live urgency badges with countdown timers (e.g. *Surgery in 48 hours*).
  - Quick filter for time-sensitive intensive care and emergency trauma interventions.
- **🔍 Multi-Dimensional Exploration**:
  - Instant live search across patient names, diagnoses, hospitals, and cities.
  - Specialty category filters: *Pediatric Cardiac, Cancer Care, Accident & Trauma, Organ Transplant, Rare Diseases*.
  - Flexible sorting: *Urgency, Most Funded, Goal: Low to High, Goal: High to Low, Recently Added*.
- **💳 Multi-Currency Support & Live Conversion**:
  - Instant conversion between **USD ($)**, **INR (₹)**, **EUR (€)**, and **GBP (£)**.
  - Responsive donation amounts and live calculation of voluntary platform tips.
- **📄 Instant Tax Exemption Receipts (80G / 501(c)(3))**:
  - Downloadable & printable official digital receipts.
  - Unique transaction ID generation and history tracking via LocalStorage.
- **🎉 Confetti Celebrations**:
  - Engaging visual donor feedback on completed donations.
- **📝 Multi-Step Fundraiser Creation Wizard**:
  - Step 1: Patient details & relationship.
  - Step 2: Treating hospital, doctor, diagnosis, and financial goal.
  - Step 3: Story, medical document upload simulation, and immediate live publication.

---

## 🗂️ Project Structure

```text
medical-fund/
├── index.html         # Main web application & interactive UI
├── css/
│   └── styles.css     # Custom animations, glassmorphism, progress bars & print styles
├── js/
│   ├── data.js        # Seed campaigns, clinical conditions, hospital data & exchange rates
│   ├── storage.js     # LocalStorage state management for campaigns, donations & receipts
│   └── app.js         # Core application controller, modal wizards & filter engine
├── .gitignore         # Clean repository ignore patterns
└── README.md          # Project documentation
```

---

## 🚀 Getting Started

### Option 1: Direct Browser Launch
No installation or build steps required! Simply double-click [`index.html`](index.html) or open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server
Using Python:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

Using Node.js (npx):
```bash
npx serve .
```

### Option 3: GitHub Pages Deployment
1. Go to repository **Settings** > **Pages**.
2. Select **Branch: main** and folder **/(root)**.
3. Click **Save**. Your site will be live instantly!

---

## 🔒 Security & Medical Trust Guarantee
- Zero platform deduction for emergency patients.
- Direct-to-hospital settlement model preventing donation diversion.
- All donor records and receipts are saved locally with encryption-ready data models.
