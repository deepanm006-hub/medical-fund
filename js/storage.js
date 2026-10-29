/**
 * Storage Manager for Medical Fund
 * Handles LocalStorage persistence, updates, and querying
 */
const STORAGE_KEYS = {
  CAMPAIGNS: "medical_fund_campaigns",
  DONATIONS: "medical_fund_donations",
  BOOKMARKS: "medical_fund_bookmarks",
  ACTIVE_ROLE: "medical_fund_active_role",
  CURRENCY: "medical_fund_active_currency"
};

class MedicalFundStorage {
  constructor() {
    this.init();
  }

  init() {
    // Populate seed data if not present or needs reset
    const existing = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (!existing) {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    } else {
      // Ensure seed campaigns with new schema properties are maintained
      try {
        const parsed = JSON.parse(existing);
        let updated = false;
        parsed.forEach(c => {
          if (!c.medicalDocuments) {
            c.medicalDocuments = [];
            updated = true;
          }
          if (!c.disbursements) {
            c.disbursements = [];
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(parsed));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify([]));
    }
  }

  // Retrieve all campaigns
  getCampaigns() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      return data ? JSON.parse(data) : INITIAL_CAMPAIGNS;
    } catch (e) {
      console.error("Error reading campaigns from localStorage:", e);
      return INITIAL_CAMPAIGNS;
    }
  }

  // Get campaign by ID
  getCampaignById(id) {
    const list = this.getCampaigns();
    return list.find(c => c.id === id) || null;
  }

  // Save/Update full campaigns list
  saveCampaigns(campaigns) {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  }

  // Add a new campaign
  addCampaign(campaignData) {
    const campaigns = this.getCampaigns();
    const docNumber = "DOC-REG-" + Math.floor(100000 + Math.random() * 900000);
    const newCampaign = {
      id: "med-" + Date.now().toString(36),
      raisedAmount: 0,
      donorCount: 0,
      donors: [],
      updates: [
        {
          id: "upd-" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          title: "Fundraiser Created & Submitted for Audit",
          description: "Patient clinical history and hospital estimate submitted. Hospital verification is active.",
          authorRole: "Campaign Organizer"
        }
      ],
      isVerified: true,
      verificationStatus: "Approved & Audited",
      verificationDetails: {
        hospitalVerified: true,
        billsVerified: true,
        doctorNoteVerified: true,
        hospitalRegNumber: "REG-" + Math.floor(100000 + Math.random() * 900000),
        letterDate: new Date().toISOString().split("T")[0],
        auditorName: "Dr. Elena Vance (Medical Advisory)"
      },
      medicalDocuments: [
        {
          id: "doc-" + Date.now(),
          title: "Hospital Treatment & Surgery Estimate",
          type: "Hospital Estimate",
          issueDate: new Date().toISOString().split("T")[0],
          issuedBy: campaignData.hospital,
          verified: true,
          docNumber: docNumber
        }
      ],
      disbursements: [],
      ...campaignData
    };

    campaigns.unshift(newCampaign);
    this.saveCampaigns(campaigns);
    return newCampaign;
  }

  // Add a clinical update / patient story update
  addCampaignUpdate(campaignId, { title, description, authorRole = "Family Organizer" }) {
    const campaigns = this.getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");

    if (!Array.isArray(campaign.updates)) {
      campaign.updates = [];
    }

    const newUpdate = {
      id: "upd-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      title,
      description,
      authorRole
    };

    campaign.updates.unshift(newUpdate);
    this.saveCampaigns(campaigns);
    return newUpdate;
  }

  // Update verification status (from Hospital Auditor Portal)
  updateCampaignVerification(campaignId, { isVerified, status, auditorName, auditorNotes }) {
    const campaigns = this.getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");

    campaign.isVerified = Boolean(isVerified);
    campaign.verificationStatus = status || (isVerified ? "Approved & Audited" : "Pending Review");
    
    if (!campaign.verificationDetails) {
      campaign.verificationDetails = {};
    }
    campaign.verificationDetails.hospitalVerified = Boolean(isVerified);
    campaign.verificationDetails.billsVerified = Boolean(isVerified);
    campaign.verificationDetails.doctorNoteVerified = Boolean(isVerified);
    if (auditorName) campaign.verificationDetails.auditorName = auditorName;
    if (auditorNotes) campaign.verificationDetails.auditorNotes = auditorNotes;

    // Verify all associated medical documents if approved
    if (isVerified && Array.isArray(campaign.medicalDocuments)) {
      campaign.medicalDocuments.forEach(doc => { doc.verified = true; });
    }

    this.saveCampaigns(campaigns);
    return campaign;
  }

  // Record a hospital payout tranche disbursement
  recordDisbursement(campaignId, { purpose, amount, hospitalAccount, wireReference }) {
    const campaigns = this.getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");

    if (!Array.isArray(campaign.disbursements)) {
      campaign.disbursements = [];
    }

    const trancheNum = campaign.disbursements.length + 1;
    const newDisbursement = {
      id: "disb-" + Date.now(),
      tranche: trancheNum,
      purpose,
      amount: Number(amount),
      date: new Date().toISOString().split("T")[0],
      hospitalAccount: hospitalAccount || "HOSP-AUDITED-ACCT",
      wireReference: wireReference || ("UTR-" + Math.floor(10000000 + Math.random() * 90000000)),
      status: "Transferred"
    };

    campaign.disbursements.unshift(newDisbursement);
    this.saveCampaigns(campaigns);
    return newDisbursement;
  }

  // Process a donation
  recordDonation({ campaignId, amount, donorName, email, message, isAnonymous, tipAmount = 0 }) {
    const campaigns = this.getCampaigns();
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1) {
      throw new Error("Campaign not found");
    }

    const campaign = campaigns[campaignIndex];
    const donationAmount = Number(amount);

    campaign.raisedAmount += donationAmount;
    campaign.donorCount += 1;

    const newDonorEntry = {
      name: isAnonymous ? "Anonymous Benefactor" : (donorName || "Kind Supporter"),
      amount: donationAmount,
      time: "Just now",
      message: message || "Wishing you health and strength!",
      isAnonymous: Boolean(isAnonymous)
    };

    if (!Array.isArray(campaign.donors)) {
      campaign.donors = [];
    }
    campaign.donors.unshift(newDonorEntry);

    // Save updated campaign
    campaigns[campaignIndex] = campaign;
    this.saveCampaigns(campaigns);

    // Record receipt transaction in history
    const receipt = {
      transactionId: "TXN-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      patientName: campaign.patientName,
      hospital: campaign.hospital,
      amount: donationAmount,
      tipAmount: Number(tipAmount),
      totalPaid: donationAmount + Number(tipAmount),
      donorName: isAnonymous ? "Anonymous Benefactor" : donorName,
      donorEmail: email,
      date: new Date().toISOString(),
      taxDeductibleEligible: true,
      taxExemptionCode: "MED-80G/501C3-" + Math.floor(100000 + Math.random() * 900000)
    };

    const allDonations = this.getAllDonations();
    allDonations.unshift(receipt);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(allDonations));

    return { campaign, receipt };
  }

  // Get all user donation receipts
  getAllDonations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DONATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Bookmarking / Following campaigns
  getBookmarks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  isBookmarked(campaignId) {
    return this.getBookmarks().includes(campaignId);
  }

  toggleBookmark(campaignId) {
    let bookmarks = this.getBookmarks();
    const index = bookmarks.indexOf(campaignId);
    let isNowSaved = false;
    if (index > -1) {
      bookmarks.splice(index, 1);
      isNowSaved = false;
    } else {
      bookmarks.push(campaignId);
      isNowSaved = true;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return isNowSaved;
  }

  // Role switching: "donor" | "hospital_auditor" | "patient_family"
  getActiveRole() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) || "donor";
  }

  setActiveRole(role) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
  }

  // Get platform-wide aggregated metrics
  getPlatformStats() {
    const campaigns = this.getCampaigns();
    const totalRaised = campaigns.reduce((acc, c) => acc + (c.raisedAmount || 0), 0);
    const totalGoal = campaigns.reduce((acc, c) => acc + (c.goalAmount || 0), 0);
    const totalDonors = campaigns.reduce((acc, c) => acc + (c.donorCount || 0), 0);
    const totalCampaigns = campaigns.length;
    const verifiedRate = 99.2;
    const pendingReviewCount = campaigns.filter(c => !c.isVerified || c.verificationStatus?.includes("Pending")).length;

    return {
      totalRaised,
      totalGoal,
      totalDonors,
      totalCampaigns,
      verifiedRate,
      pendingReviewCount
    };
  }

  // Preferred currency
  getCurrency() {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || "USD";
  }

  setCurrency(curr) {
    if (CURRENCIES[curr]) {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    }
  }
}

// Global singleton instance
window.storage = new MedicalFundStorage();
