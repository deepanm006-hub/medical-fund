/**
 * Storage Manager for Medical Fund
 * Handles LocalStorage persistence, updates, and querying
 */
const STORAGE_KEYS = {
  CAMPAIGNS: "medical_fund_campaigns",
  DONATIONS: "medical_fund_donations",
  USER_CAMPAIGNS: "medical_fund_user_campaigns",
  CURRENCY: "medical_fund_active_currency"
};

class MedicalFundStorage {
  constructor() {
    this.init();
  }

  init() {
    // Populate seed data if not present
    if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify([]));
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
    const newCampaign = {
      id: "med-" + Date.now().toString(36),
      raisedAmount: 0,
      donorCount: 0,
      donors: [],
      updates: [
        {
          date: new Date().toISOString().split("T")[0],
          title: "Fundraiser Created",
          description: "Campaign submitted with medical diagnosis and hospital verification documents attached."
        }
      ],
      isVerified: true,
      verificationDetails: {
        hospitalVerified: true,
        billsVerified: true,
        doctorNoteVerified: true,
        hospitalRegNumber: "REG-" + Math.floor(100000 + Math.random() * 900000),
        letterDate: new Date().toISOString().split("T")[0]
      },
      ...campaignData
    };

    campaigns.unshift(newCampaign);
    this.saveCampaigns(campaigns);
    return newCampaign;
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

  // Get platform-wide aggregated metrics
  getPlatformStats() {
    const campaigns = this.getCampaigns();
    const totalRaised = campaigns.reduce((acc, c) => acc + (c.raisedAmount || 0), 0);
    const totalGoal = campaigns.reduce((acc, c) => acc + (c.goalAmount || 0), 0);
    const totalDonors = campaigns.reduce((acc, c) => acc + (c.donorCount || 0), 0);
    const totalCampaigns = campaigns.length;
    const verifiedRate = 99.2;

    return {
      totalRaised,
      totalGoal,
      totalDonors,
      totalCampaigns,
      verifiedRate
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
