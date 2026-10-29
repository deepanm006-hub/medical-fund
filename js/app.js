/**
 * Main Application Logic for Medical Fund
 * Enhanced with 5-Tab Clinical Architecture, Hospital Auditor Portal,
 * Recovery Updates, Hospital Disbursements Ledger, Bookmark System,
 * Payment Gateway Simulation (Card, UPI QR, Wallets) & Hospital Partner Directory
 */

class MedicalFundApp {
  constructor() {
    this.activeCategory = "all";
    this.searchQuery = "";
    this.sortOption = "urgent";
    this.activeCampaignId = null;
    this.activeDetailTab = "story"; // 'story' | 'documents' | 'updates' | 'disbursements' | 'donors'
    this.donationTargetCampaign = null;
    this.currentWizardStep = 1;
    this.postUpdateTargetCampaignId = null;
    this.activePaymentMethod = "card"; // 'card' | 'upi' | 'wallet'

    this.init();
  }

  init() {
    // Set currency selector
    const currentCurrency = window.storage.getCurrency();
    const currencySelect = document.getElementById("currency-select");
    if (currencySelect) {
      currencySelect.value = currentCurrency;
      currencySelect.addEventListener("change", (e) => this.handleCurrencyChange(e.target.value));
    }

    // Set role selector
    const roleSelect = document.getElementById("role-select");
    if (roleSelect) {
      roleSelect.value = window.storage.getActiveRole();
      roleSelect.addEventListener("change", (e) => {
        window.storage.setActiveRole(e.target.value);
        this.showToast(`Switched view to: ${e.target.options[e.target.selectedIndex].text}`);
        if (e.target.value === "hospital_auditor") {
          this.openAuditorModal();
        }
      });
    }

    // Initialize Event Listeners
    this.initEventListeners();

    // Render components
    this.renderCategoryPills();
    this.renderCampaigns();
    this.renderUrgentCampaigns();
    this.updatePlatformStats();
    this.updateReceiptCount();
    this.updateBookmarkCount();
    this.updateAuditorBadges();

    // Init Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- Currency Formatting Helper ---
  formatAmount(amountInUSD) {
    const currencyCode = window.storage.getCurrency();
    const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
    const converted = amountInUSD * config.rate;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0
    }).format(converted);
  }

  handleCurrencyChange(newCurrency) {
    window.storage.setCurrency(newCurrency);
    this.renderCampaigns();
    this.renderUrgentCampaigns();
    this.updatePlatformStats();
    
    // Update active modals if open
    if (this.activeCampaignId) {
      this.openDetailModal(this.activeCampaignId, this.activeDetailTab);
    }
    if (this.donationTargetCampaign) {
      this.setupDonationPresets();
    }

    this.showToast(`Currency changed to ${newCurrency}`);
  }

  // --- Event Listeners Setup ---
  initEventListeners() {
    // Search input
    const searchInput = document.getElementById("search-input");
    const clearBtn = document.getElementById("search-clear-btn");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (clearBtn) {
          clearBtn.classList.toggle("hidden", this.searchQuery === "");
        }
        this.renderCampaigns();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        this.searchQuery = "";
        clearBtn.classList.add("hidden");
        this.renderCampaigns();
      });
    }

    // Sort select
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortOption = e.target.value;
        this.renderCampaigns();
      });
    }

    // Mobile nav toggle
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });

      document.querySelectorAll(".mobile-nav-link").forEach(link => {
        link.addEventListener("click", () => mobileMenu.classList.add("hidden"));
      });
    }

    // Header buttons
    const btnOpenCreate = document.getElementById("btn-open-create");
    if (btnOpenCreate) {
      btnOpenCreate.addEventListener("click", () => this.openCreateModal());
    }

    const btnReceipts = document.getElementById("btn-view-receipts");
    if (btnReceipts) {
      btnReceipts.addEventListener("click", () => this.openAllReceiptsModal());
    }

    const btnBookmarks = document.getElementById("btn-view-bookmarks");
    if (btnBookmarks) {
      btnBookmarks.addEventListener("click", () => this.openBookmarksModal());
    }

    const btnAuditor = document.getElementById("btn-open-auditor-portal");
    if (btnAuditor) {
      btnAuditor.addEventListener("click", () => this.openAuditorModal());
    }

    const btnHospitals = document.getElementById("btn-open-hospitals-directory");
    if (btnHospitals) {
      btnHospitals.addEventListener("click", () => this.openHospitalsModal());
    }

    const btnModules = document.getElementById("btn-open-modules-hub");
    if (btnModules) {
      btnModules.addEventListener("click", () => this.openModulesHubModal());
    }

    // Donation Form Submit
    const donationForm = document.getElementById("donation-form");
    if (donationForm) {
      donationForm.addEventListener("submit", (e) => this.handleDonationSubmit(e));
    }

    // Tip selection changed
    const tipSelect = document.getElementById("tip-select");
    if (tipSelect) {
      tipSelect.addEventListener("change", () => this.calculateDonationTotal());
    }

    // Custom amount input
    const customAmountInput = document.getElementById("custom-amount-input");
    if (customAmountInput) {
      customAmountInput.addEventListener("input", () => {
        document.querySelectorAll(".preset-amount-btn").forEach(b => b.classList.remove("border-brand-600", "bg-brand-50", "text-brand-700"));
        this.calculateDonationTotal();
      });
    }

    // Create Fundraiser Form Submit
    const createForm = document.getElementById("create-fundraiser-form");
    if (createForm) {
      createForm.addEventListener("submit", (e) => this.handleCreateFundraiserSubmit(e));
    }

    // Post Update Form Submit
    const updateForm = document.getElementById("post-update-form");
    if (updateForm) {
      updateForm.addEventListener("submit", (e) => this.handlePostUpdateSubmit(e));
    }
  }

  // --- Category Pills ---
  renderCategoryPills() {
    const container = document.getElementById("category-pills");
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => {
      const isActive = this.activeCategory === cat.id;
      const activeClass = isActive 
        ? "bg-slate-900 text-white shadow-sm" 
        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200";

      return `
        <button 
          onclick="app.setCategoryFilter('${cat.id}')"
          class="flex-shrink-0 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeClass}"
        >
          <i data-lucide="${cat.icon}" class="w-3.5 h-3.5"></i>
          <span>${cat.name}</span>
        </button>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  setCategoryFilter(categoryId) {
    this.activeCategory = categoryId;
    this.renderCategoryPills();
    this.renderCampaigns();
    
    const target = document.getElementById("campaigns-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  resetFilters() {
    this.activeCategory = "all";
    this.searchQuery = "";
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";
    const clearBtn = document.getElementById("search-clear-btn");
    if (clearBtn) clearBtn.classList.add("hidden");

    this.renderCategoryPills();
    this.renderCampaigns();
  }

  // --- Filter and Sort Logic ---
  getFilteredCampaigns() {
    let list = window.storage.getCampaigns();

    if (this.activeCategory === "urgent") {
      list = list.filter(c => c.isUrgent);
    } else if (this.activeCategory !== "all") {
      list = list.filter(c => c.category === this.activeCategory);
    }

    if (this.searchQuery) {
      list = list.filter(c => {
        const titleMatch = (c.title || "").toLowerCase().includes(this.searchQuery);
        const nameMatch = (c.patientName || "").toLowerCase().includes(this.searchQuery);
        const hospitalMatch = (c.hospital || "").toLowerCase().includes(this.searchQuery);
        const conditionMatch = (c.condition || "").toLowerCase().includes(this.searchQuery);
        const cityMatch = (c.city || "").toLowerCase().includes(this.searchQuery);
        return titleMatch || nameMatch || hospitalMatch || conditionMatch || cityMatch;
      });
    }

    list = [...list].sort((a, b) => {
      if (this.sortOption === "urgent") {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return (a.daysLeft || 99) - (b.daysLeft || 99);
      }
      if (this.sortOption === "funded") {
        const percentA = (a.raisedAmount / a.goalAmount) * 100;
        const percentB = (b.raisedAmount / b.goalAmount) * 100;
        return percentB - percentA;
      }
      if (this.sortOption === "goal-asc") {
        return a.goalAmount - b.goalAmount;
      }
      if (this.sortOption === "goal-desc") {
        return b.goalAmount - a.goalAmount;
      }
      if (this.sortOption === "newest") {
        return (b.id || "").localeCompare(a.id || "");
      }
      return 0;
    });

    return list;
  }

  // --- Render Campaigns Grid ---
  renderCampaigns() {
    const grid = document.getElementById("campaigns-grid");
    const emptyState = document.getElementById("empty-state");
    const counter = document.getElementById("campaigns-counter");
    if (!grid) return;

    const campaigns = this.getFilteredCampaigns();

    if (counter) {
      counter.textContent = `Showing ${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'}`;
    }

    if (campaigns.length === 0) {
      grid.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    grid.innerHTML = campaigns.map(c => this.generateCampaignCardHTML(c)).join("");
    if (window.lucide) window.lucide.createIcons();
  }

  // --- Render Urgent Spotlight Campaigns ---
  renderUrgentCampaigns() {
    const grid = document.getElementById("urgent-campaigns-grid");
    if (!grid) return;

    const urgentList = window.storage.getCampaigns().filter(c => c.isUrgent).slice(0, 3);
    grid.innerHTML = urgentList.map(c => this.generateCampaignCardHTML(c, true)).join("");
    if (window.lucide) window.lucide.createIcons();
  }

  // --- Card HTML Generator ---
  generateCampaignCardHTML(campaign, isUrgentHighlight = false) {
    const percent = Math.min(Math.round((campaign.raisedAmount / campaign.goalAmount) * 100), 100);
    const isSaved = window.storage.isBookmarked(campaign.id);
    const isVerified = campaign.isVerified;

    const borderStyle = campaign.isUrgent 
      ? "border-rose-200 hover:border-rose-300 shadow-sm hover:shadow-md" 
      : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md";

    return `
      <div class="bg-white rounded-3xl overflow-hidden border ${borderStyle} flex flex-col transition-all duration-300 hover:-translate-y-1 group relative">
        
        <!-- Image & Tags Overlay -->
        <div class="relative h-52 w-full overflow-hidden bg-slate-100">
          <img 
            src="${campaign.image}" 
            alt="${campaign.title}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onclick="app.openDetailModal('${campaign.id}')"
            onerror="this.src='https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20 pointer-events-none"></div>

          <!-- Category Pill -->
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            ${campaign.category}
          </span>

          <!-- Bookmark & Urgent Badges -->
          <div class="absolute top-3 right-3 flex items-center space-x-1.5">
            <button 
              onclick="event.stopPropagation(); app.toggleBookmark('${campaign.id}', this)"
              class="w-7 h-7 rounded-full bg-slate-900/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
              title="Bookmark / Follow"
            >
              <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'}"></i>
            </button>

            ${campaign.isUrgent ? `
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-md flex items-center space-x-1 urgent-badge-glow">
                <i data-lucide="flame" class="w-3 h-3"></i>
                <span>${campaign.daysLeft}d left</span>
              </span>
            ` : `
              <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/70 text-slate-200 backdrop-blur-sm flex items-center space-x-1">
                <i data-lucide="clock" class="w-3 h-3"></i>
                <span>${campaign.daysLeft}d left</span>
              </span>
            `}
          </div>

          <!-- Hospital Badge on Image Bottom -->
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span class="flex items-center text-emerald-300 font-bold truncate max-w-[210px]">
              <i data-lucide="${isVerified ? 'shield-check' : 'shield-alert'}" class="w-4 h-4 mr-1 flex-shrink-0 ${isVerified ? 'text-emerald-400' : 'text-amber-400'}"></i>
              <span class="truncate">${campaign.hospital}</span>
            </span>
            <span class="text-[11px] bg-slate-900/80 px-2 py-0.5 rounded-full font-medium text-slate-300">
              ${campaign.city.split(',')[0]}
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 flex flex-col flex-grow">
          
          <!-- Patient Meta -->
          <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>Patient: <strong class="text-slate-800">${campaign.patientName}</strong> (${campaign.patientAge}y)</span>
            ${isVerified ? `
              <span class="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] flex items-center">
                <i data-lucide="check" class="w-3 h-3 mr-0.5"></i> Audited
              </span>
            ` : `
              <span class="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[10px] flex items-center">
                <i data-lucide="clock" class="w-3 h-3 mr-0.5"></i> Reviewing
              </span>
            `}
          </div>

          <!-- Campaign Title -->
          <h3 class="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 hover:text-brand-600 transition-colors cursor-pointer" onclick="app.openDetailModal('${campaign.id}')">
            ${campaign.title}
          </h3>

          <p class="text-xs text-slate-500 mt-2 line-clamp-2">
            ${campaign.story}
          </p>

          <!-- Progress Bar & Amounts -->
          <div class="mt-5 space-y-2">
            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div class="bg-gradient-to-r from-brand-500 to-tealbrand-500 h-2.5 rounded-full progress-fill" style="width: ${percent}%"></div>
            </div>

            <div class="flex justify-between items-center text-xs">
              <div>
                <span class="text-slate-900 font-extrabold text-sm">${this.formatAmount(campaign.raisedAmount)}</span>
                <span class="text-slate-400"> raised of ${this.formatAmount(campaign.goalAmount)}</span>
              </div>
              <span class="font-extrabold text-emerald-700">${percent}%</span>
            </div>
          </div>

          <!-- Donors Count & Action Buttons -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <span class="text-xs text-slate-500 flex items-center">
              <i data-lucide="heart" class="w-3.5 h-3.5 mr-1 text-rose-500 fill-rose-500"></i>
              <strong>${campaign.donorCount}</strong>&nbsp;donors
            </span>

            <div class="flex items-center space-x-2">
              <button 
                onclick="app.openDetailModal('${campaign.id}')"
                class="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Records
              </button>
              <button 
                onclick="app.openDonateModal('${campaign.id}')"
                class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-emerald-600/30 transition-all flex items-center space-x-1"
              >
                <i data-lucide="hand-heart" class="w-3.5 h-3.5"></i>
                <span>Donate</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // --- Campaign Detail Modal with 5-Tab Architecture ---
  openDetailModal(campaignId, activeTab = "story") {
    this.activeCampaignId = campaignId;
    this.activeDetailTab = activeTab;

    const campaign = window.storage.getCampaignById(campaignId);
    if (!campaign) return;

    const modal = document.getElementById("modal-detail");
    const body = document.getElementById("detail-modal-body");
    if (!modal || !body) return;

    const percent = Math.min(Math.round((campaign.raisedAmount / campaign.goalAmount) * 100), 100);
    const isSaved = window.storage.isBookmarked(campaign.id);
    const docs = campaign.medicalDocuments || [];
    const disb = campaign.disbursements || [];
    const updates = campaign.updates || [];
    const donors = campaign.donors || [];

    body.innerHTML = `
      <!-- Hero Image Header -->
      <div class="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
        <img src="${campaign.image}" alt="${campaign.title}" class="w-full h-full object-cover opacity-90">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>

        <!-- Top action buttons (Bookmark + Share) -->
        <div class="absolute top-4 left-6 flex items-center space-x-2 z-10">
          <button 
            onclick="app.toggleBookmark('${campaign.id}', this)"
            class="px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-900 transition-colors border border-white/20"
          >
            <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'}"></i>
            <span>${isSaved ? 'Saved Case' : 'Bookmark Case'}</span>
          </button>
          <button 
            onclick="app.shareCampaign('${campaign.id}')"
            class="px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-900 transition-colors border border-white/20"
          >
            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
            <span>Share</span>
          </button>
        </div>

        <div class="absolute bottom-6 left-6 right-6 text-white">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-600 text-white">${campaign.category}</span>
            ${campaign.isUrgent ? `<span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center"><i data-lucide="flame" class="w-3 h-3 mr-1"></i>Urgent Surgery</span>` : ''}
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-emerald-300 flex items-center">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 mr-1"></i>${campaign.verificationStatus || 'Hospital Verified'}
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight">${campaign.title}</h2>
        </div>
      </div>

      <!-- Navigation Tabs Bar -->
      <div class="bg-slate-100 border-b border-slate-200 px-6 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs font-bold text-slate-600">
        <button 
          onclick="app.switchDetailTab('story')" 
          class="py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${this.activeDetailTab === 'story' ? 'border-brand-600 text-brand-700 bg-white shadow-sm' : 'border-transparent hover:text-slate-900'}"
        >
          <i data-lucide="file-text" class="w-4 h-4"></i>
          <span>1. Story & Diagnosis</span>
        </button>

        <button 
          onclick="app.switchDetailTab('documents')" 
          class="py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${this.activeDetailTab === 'documents' ? 'border-brand-600 text-brand-700 bg-white shadow-sm' : 'border-transparent hover:text-slate-900'}"
        >
          <i data-lucide="file-check" class="w-4 h-4 text-emerald-600"></i>
          <span>2. Verified Documents (${docs.length})</span>
        </button>

        <button 
          onclick="app.switchDetailTab('updates')" 
          class="py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${this.activeDetailTab === 'updates' ? 'border-brand-600 text-brand-700 bg-white shadow-sm' : 'border-transparent hover:text-slate-900'}"
        >
          <i data-lucide="activity" class="w-4 h-4 text-tealbrand-600"></i>
          <span>3. Recovery Timeline (${updates.length})</span>
        </button>

        <button 
          onclick="app.switchDetailTab('disbursements')" 
          class="py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${this.activeDetailTab === 'disbursements' ? 'border-brand-600 text-brand-700 bg-white shadow-sm' : 'border-transparent hover:text-slate-900'}"
        >
          <i data-lucide="landmark" class="w-4 h-4 text-indigo-600"></i>
          <span>4. Hospital Payouts (${disb.length})</span>
        </button>

        <button 
          onclick="app.switchDetailTab('donors')" 
          class="py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${this.activeDetailTab === 'donors' ? 'border-brand-600 text-brand-700 bg-white shadow-sm' : 'border-transparent hover:text-slate-900'}"
        >
          <i data-lucide="users" class="w-4 h-4"></i>
          <span>5. Donors (${donors.length})</span>
        </button>
      </div>

      <!-- Main Modal Content Grid -->
      <div class="p-6 sm:p-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left 2 Cols: Tab Dynamic View -->
          <div class="lg:col-span-2 space-y-6">
            ${this.renderDetailTabContent(campaign)}
          </div>

          <!-- Right 1 Col: Floating Sticky Action Box -->
          <div class="space-y-6">
            <div class="bg-slate-50 p-6 rounded-3xl border border-slate-200 sticky top-4 space-y-5">
              
              <div class="space-y-2">
                <div class="flex justify-between items-baseline">
                  <span class="text-2xl font-extrabold text-slate-900">${this.formatAmount(campaign.raisedAmount)}</span>
                  <span class="text-xs text-slate-500 font-medium">Goal: ${this.formatAmount(campaign.goalAmount)}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div class="bg-gradient-to-r from-brand-600 to-tealbrand-500 h-3 rounded-full" style="width: ${percent}%"></div>
                </div>
                <div class="flex justify-between text-xs text-slate-500 font-semibold pt-1">
                  <span>${percent}% funded</span>
                  <span>${campaign.donorCount} donors</span>
                </div>
              </div>

              <button 
                onclick="app.closeDetailModal(); app.openDonateModal('${campaign.id}');"
                class="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
              >
                <i data-lucide="heart" class="w-4 h-4 fill-white"></i>
                <span>Donate to this Cause</span>
              </button>

              <button 
                onclick="app.openPostUpdateModal('${campaign.id}')"
                class="w-full py-2.5 rounded-2xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors flex items-center justify-center space-x-1.5"
              >
                <i data-lucide="plus" class="w-3.5 h-3.5 text-brand-600"></i>
                <span>Post Clinical Update as Organizer</span>
              </button>

              <div class="text-[11px] text-slate-500 text-center space-y-1">
                <p>✓ 100% Tax Deductible (80G / 501c3)</p>
                <p>✓ Disbursed directly to hospital account</p>
                <p>✓ Transparent hospital bill audits</p>
              </div>

              <!-- Quick Donor Snapshot -->
              <div class="pt-4 border-t border-slate-200">
                <div class="flex justify-between items-center mb-2">
                  <h5 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Donors</h5>
                  <button onclick="app.switchDetailTab('donors')" class="text-[11px] text-brand-600 font-bold hover:underline">View All</button>
                </div>
                <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                  ${donors.slice(0, 3).map(d => `
                    <div class="text-xs pb-1.5 border-b border-slate-100 last:border-0 flex justify-between">
                      <span class="font-medium text-slate-700 truncate max-w-[140px]">${d.name}</span>
                      <span class="font-bold text-emerald-700">${this.formatAmount(d.amount)}</span>
                    </div>
                  `).join("")}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  switchDetailTab(tabName) {
    if (this.activeCampaignId) {
      this.openDetailModal(this.activeCampaignId, tabName);
    }
  }

  // --- Dynamic Tab Content Renderer ---
  renderDetailTabContent(campaign) {
    if (this.activeDetailTab === "story") {
      return `
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span class="text-slate-400 block font-medium">Patient Name</span>
            <span class="font-extrabold text-slate-800 text-sm">${campaign.patientName}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Age & Gender</span>
            <span class="font-bold text-slate-800">${campaign.patientAge} Years • ${campaign.gender || 'Patient'}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Relation</span>
            <span class="font-bold text-slate-800">${campaign.relationship || 'Family'}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Medical Condition</span>
            <span class="font-bold text-slate-800 text-rose-700">${campaign.condition}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Treating Hospital</span>
            <span class="font-bold text-slate-800">${campaign.hospital}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Attending Doctor</span>
            <span class="font-bold text-slate-800">${campaign.doctorName || 'Clinical Lead'}</span>
          </div>
        </div>

        <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <i data-lucide="file-check-2" class="w-5 h-5"></i>
            </div>
            <div>
              <span class="font-bold text-emerald-900 block text-sm">Verified Clinical Documents</span>
              <span class="text-emerald-700">Hospital Quota Reg: ${campaign.verificationDetails?.hospitalRegNumber || 'FEHI-9942'}</span>
            </div>
          </div>
          <button onclick="app.switchDetailTab('documents')" class="bg-white px-3 py-1.5 rounded-xl border border-emerald-300 font-bold text-emerald-800 hover:bg-emerald-50 transition-colors">
            Inspect Documents (${(campaign.medicalDocuments || []).length}) →
          </button>
        </div>

        <div>
          <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Patient Story & Appeal</h4>
          <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
            ${campaign.story}
          </div>
        </div>

        <div>
          <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Estimated Cost Allocation</h4>
          <div class="space-y-3">
            ${(campaign.costBreakdown || [
              { item: "Surgical Suite & Anesthesia", percentage: 50, amount: campaign.goalAmount * 0.5 },
              { item: "Intensive Care Unit (ICU)", percentage: 30, amount: campaign.goalAmount * 0.3 },
              { item: "Prescribed Medications & Diagnostics", percentage: 20, amount: campaign.goalAmount * 0.2 }
            ]).map(c => `
              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>${c.item}</span>
                  <span class="text-slate-900 font-bold">${this.formatAmount(c.amount)} (${c.percentage}%)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div class="bg-tealbrand-500 h-2 rounded-full" style="width: ${c.percentage}%"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    if (this.activeDetailTab === "documents") {
      const docs = campaign.medicalDocuments || [];
      return `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Clinical Audit Documentation</h4>
              <p class="text-xs text-slate-500">Every document is vetted with the hospital's clinical billing authority.</p>
            </div>
            <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
              Hospital Verified ✓
            </span>
          </div>

          ${docs.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <i data-lucide="file-question" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p>Documents currently being archived into digital registry.</p>
            </div>
          ` : `
            <div class="space-y-3">
              ${docs.map(doc => `
                <div class="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors shadow-sm flex items-center justify-between text-xs">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <i data-lucide="file-text" class="w-5 h-5"></i>
                    </div>
                    <div>
                      <div class="font-extrabold text-slate-900">${doc.title}</div>
                      <div class="text-[11px] text-slate-400">
                        Type: <span class="font-medium text-slate-600">${doc.type}</span> • Issued by: <span class="font-medium text-slate-600">${doc.issuedBy}</span>
                      </div>
                      <div class="text-[10px] font-mono text-emerald-700 mt-0.5">Ref: ${doc.docNumber || 'DOC-REG'}</div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${doc.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                      ${doc.verified ? 'Verified ✓' : 'Under Review'}
                    </span>
                    <button 
                      onclick="app.showDocumentPreview('${doc.title}', '${doc.type}', '${doc.issuedBy}', '${doc.docNumber}')"
                      class="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-[11px] transition-colors"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      `;
    }

    if (this.activeDetailTab === "updates") {
      const updates = campaign.updates || [];
      return `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Patient Recovery Timeline</h4>
              <p class="text-xs text-slate-500">Live health updates posted by family and attending clinical leads.</p>
            </div>
            <button 
              onclick="app.openPostUpdateModal('${campaign.id}')"
              class="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors flex items-center space-x-1"
            >
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Post Update</span>
            </button>
          </div>

          ${updates.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <i data-lucide="activity" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p>No recovery updates posted yet.</p>
            </div>
          ` : `
            <div class="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              ${updates.map(u => `
                <div class="relative">
                  <div class="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-brand-600 border-2 border-white shadow-sm"></div>
                  <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="font-extrabold text-slate-900 text-sm">${u.title}</span>
                      <span class="text-slate-400 text-[11px]">${u.date}</span>
                    </div>
                    <p class="text-slate-600 leading-relaxed text-xs">${u.description}</p>
                    <div class="text-[10px] text-emerald-800 font-semibold pt-1">
                      Posted by: ${u.authorRole || 'Medical Staff / Family'}
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      `;
    }

    if (this.activeDetailTab === "disbursements") {
      const disb = campaign.disbursements || [];
      const totalDisbursed = disb.reduce((acc, d) => acc + (d.amount || 0), 0);

      return `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Direct Hospital Payout Ledger</h4>
              <p class="text-xs text-slate-500">Audited tranche disbursements directly transferred to hospital billing accounts.</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400 block">Total Disbursed:</span>
              <span class="text-emerald-700 font-extrabold text-sm">${this.formatAmount(totalDisbursed)}</span>
            </div>
          </div>

          <div class="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-200 mb-4 text-xs text-indigo-900 flex items-start space-x-2">
            <i data-lucide="shield-alert" class="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0"></i>
            <div>
              <strong>100% Anti-Diversion Guarantee:</strong> Funds are never paid to personal checking accounts. All transfers are executed via verified clinical wire tranches against cleared hospital invoices.
            </div>
          </div>

          ${disb.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <i data-lucide="landmark" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p>First tranche disbursement will execute once pre-surgery milestones are confirmed.</p>
            </div>
          ` : `
            <div class="space-y-3">
              ${disb.map(d => `
                <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-900 text-sm">Tranche #${d.tranche}: ${d.purpose}</span>
                    <span class="font-extrabold text-emerald-700 text-sm">${this.formatAmount(d.amount)}</span>
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <div>
                      <span class="text-slate-400 block">Transfer Date:</span>
                      <span class="font-medium text-slate-800">${d.date}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block">Beneficiary Account:</span>
                      <span class="font-medium text-slate-800">${d.hospitalAccount}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block">Wire Reference:</span>
                      <span class="font-mono text-slate-800">${d.wireReference}</span>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      `;
    }

    if (this.activeDetailTab === "donors") {
      const donors = campaign.donors || [];
      return `
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Supporters & Words of Encouragement</h4>
              <p class="text-xs text-slate-500">${campaign.donorCount} community donors supporting ${campaign.patientName}.</p>
            </div>
          </div>

          ${donors.length === 0 ? `
            <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <i data-lucide="heart" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
              <p>Be the very first donor to leave a message of support!</p>
            </div>
          ` : `
            <div class="space-y-3">
              ${donors.map(d => `
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-extrabold text-slate-900 text-sm">${d.name}</span>
                    <span class="font-bold text-emerald-700 text-sm">${this.formatAmount(d.amount)}</span>
                  </div>
                  ${d.message ? `<p class="text-slate-600 italic">"${d.message}"</p>` : ''}
                  <span class="text-[10px] text-slate-400 block mt-1">${d.time}</span>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      `;
    }

    return '';
  }

  closeDetailModal() {
    const modal = document.getElementById("modal-detail");
    if (modal) modal.classList.add("hidden");
    this.activeCampaignId = null;
  }

  showDocumentPreview(title, type, issuedBy, docNumber) {
    this.openDocViewerModal(title, type, issuedBy, docNumber);
  }

  openDocViewerModal(title, type, issuedBy, docNumber) {
    const modal = document.getElementById("modal-doc-viewer");
    if (!modal) return;

    const titleEl = document.getElementById("doc-view-title");
    const issuerEl = document.getElementById("doc-view-issuer");
    const refEl = document.getElementById("doc-view-ref");
    const typeEl = document.getElementById("doc-view-type");

    if (titleEl) titleEl.textContent = title || "Clinical Record";
    if (issuerEl) issuerEl.textContent = `Issued by: ${issuedBy || "Clinical Center"}`;
    if (refEl) refEl.textContent = docNumber || "REG-DOC-001";
    if (typeEl) typeEl.textContent = type || "Medical Certificate";

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeDocViewerModal() {
    const modal = document.getElementById("modal-doc-viewer");
    if (modal) modal.classList.add("hidden");
  }

  // --- All 12 Modules Hub Modal ---
  openModulesHubModal() {
    const modal = document.getElementById("modal-modules-hub");
    if (modal) {
      modal.classList.remove("hidden");
      if (window.lucide) window.lucide.createIcons();
    }
  }

  closeModulesHubModal() {
    const modal = document.getElementById("modal-modules-hub");
    if (modal) modal.classList.add("hidden");
  }

  // --- Bookmarking / Saving Cases ---
  toggleBookmark(campaignId, btnElement) {
    const isSaved = window.storage.toggleBookmark(campaignId);
    this.updateBookmarkCount();
    this.renderCampaigns();
    this.renderUrgentCampaigns();

    if (this.activeCampaignId === campaignId) {
      this.openDetailModal(campaignId, this.activeDetailTab);
    }

    this.showToast(isSaved ? "Saved case to your bookmarks" : "Removed from bookmarks");
  }

  updateBookmarkCount() {
    const countEl = document.getElementById("my-bookmarks-count");
    if (countEl) {
      countEl.textContent = window.storage.getBookmarks().length;
    }
  }

  openBookmarksModal() {
    const modal = document.getElementById("modal-bookmarks");
    const container = document.getElementById("bookmarks-list");
    if (!modal || !container) return;

    const bookmarkedIds = window.storage.getBookmarks();
    const allCampaigns = window.storage.getCampaigns();
    const savedCampaigns = allCampaigns.filter(c => bookmarkedIds.includes(c.id));

    if (savedCampaigns.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-xs">
          <i data-lucide="bookmark" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
          <p>You haven't bookmarked any cases yet.</p>
          <p class="text-[11px] text-slate-400 mt-1">Click the bookmark icon on any campaign to track patient recovery.</p>
        </div>
      `;
    } else {
      container.innerHTML = savedCampaigns.map(c => `
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-900">${c.patientName} (${c.condition})</div>
            <div class="text-[11px] text-slate-400">${c.hospital} • ${c.category}</div>
          </div>
          <div class="flex items-center space-x-2">
            <button onclick="app.closeBookmarksModal(); app.openDetailModal('${c.id}')" class="text-xs font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100">
              View
            </button>
            <button onclick="app.closeBookmarksModal(); app.openDonateModal('${c.id}')" class="text-xs font-bold text-white bg-brand-600 px-3 py-1.5 rounded-xl hover:bg-brand-700">
              Donate
            </button>
          </div>
        </div>
      `).join("");
    }

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeBookmarksModal() {
    const modal = document.getElementById("modal-bookmarks");
    if (modal) modal.classList.add("hidden");
  }

  shareCampaign(campaignId) {
    const campaign = window.storage.getCampaignById(campaignId);
    if (!campaign) return;

    const shareUrl = window.location.href.split('#')[0] + `#campaign-${campaignId}`;
    const shareText = `Please support ${campaign.patientName}'s medical treatment for ${campaign.condition} at ${campaign.hospital}: ${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      this.showToast("Campaign link copied to clipboard!");
    } else {
      prompt("Copy campaign link:", shareUrl);
    }
  }

  // --- Payment Method Selector in Donation Modal ---
  setPaymentMethod(method, btnElement) {
    this.activePaymentMethod = method;

    document.querySelectorAll(".pay-method-btn").forEach(b => {
      b.className = "pay-method-btn p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold flex flex-col items-center justify-center space-y-1";
    });

    if (btnElement) {
      btnElement.className = "pay-method-btn p-2.5 rounded-xl border border-brand-600 bg-brand-50 text-brand-700 text-xs font-bold flex flex-col items-center justify-center space-y-1";
    }

    const cardSec = document.getElementById("pay-card-section");
    const upiSec = document.getElementById("pay-upi-section");
    const walletSec = document.getElementById("pay-wallet-section");

    if (cardSec) cardSec.classList.toggle("hidden", method !== "card");
    if (upiSec) upiSec.classList.toggle("hidden", method !== "upi");
    if (walletSec) walletSec.classList.toggle("hidden", method !== "wallet");

    if (window.lucide) window.lucide.createIcons();
  }

  // --- Donation Modal Logic ---
  openDonateModal(campaignId) {
    const campaign = window.storage.getCampaignById(campaignId);
    if (!campaign) return;

    this.donationTargetCampaign = campaign;
    this.activePaymentMethod = "card";

    const modal = document.getElementById("modal-donate");
    const titleEl = document.getElementById("donate-modal-title");
    const patientEl = document.getElementById("donate-modal-patient");

    if (titleEl) titleEl.textContent = `Donate to ${campaign.title}`;
    if (patientEl) patientEl.textContent = `Beneficiary: ${campaign.patientName} • ${campaign.hospital}`;

    this.setupDonationPresets();
    this.calculateDonationTotal();

    const overlay = document.getElementById("payment-processing-overlay");
    if (overlay) overlay.classList.add("hidden");

    if (modal) modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  setupDonationPresets() {
    const curr = window.storage.getCurrency();
    const config = CURRENCIES[curr] || CURRENCIES.USD;
    
    const symbolEl = document.getElementById("donate-currency-symbol");
    if (symbolEl) symbolEl.textContent = config.symbol;

    const baseAmounts = [25, 50, 100, 250];
    const grid = document.getElementById("preset-amounts-grid");
    if (!grid) return;

    grid.innerHTML = baseAmounts.map((base, idx) => {
      const converted = Math.round(base * config.rate);
      const isDefault = idx === 1;
      return `
        <button 
          type="button" 
          onclick="app.selectPresetAmount(${base}, this)"
          class="preset-amount-btn py-2 px-1 text-center font-extrabold text-xs rounded-xl border transition-all ${isDefault ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}"
          data-amount="${base}"
        >
          ${config.symbol}${converted}
        </button>
      `;
    }).join("");

    this.calculateDonationTotal();
  }

  selectPresetAmount(usdBaseAmount, buttonEl) {
    const customInput = document.getElementById("custom-amount-input");
    if (customInput) customInput.value = "";

    document.querySelectorAll(".preset-amount-btn").forEach(b => {
      b.classList.remove("border-brand-600", "bg-brand-50", "text-brand-700");
      b.classList.add("border-slate-200", "bg-slate-50", "text-slate-700");
    });

    if (buttonEl) {
      buttonEl.classList.add("border-brand-600", "bg-brand-50", "text-brand-700");
      buttonEl.classList.remove("border-slate-200", "bg-slate-50", "text-slate-700");
    }

    this.calculateDonationTotal();
  }

  getSelectedDonationBaseUSD() {
    const customInput = document.getElementById("custom-amount-input");
    const curr = window.storage.getCurrency();
    const config = CURRENCIES[curr] || CURRENCIES.USD;

    if (customInput && customInput.value && Number(customInput.value) > 0) {
      return Number(customInput.value) / config.rate;
    }

    const activePreset = document.querySelector(".preset-amount-btn.bg-brand-50");
    if (activePreset) {
      return Number(activePreset.dataset.amount);
    }

    return 50;
  }

  calculateDonationTotal() {
    const baseUSD = this.getSelectedDonationBaseUSD();
    const tipSelect = document.getElementById("tip-select");
    const tipPercent = tipSelect ? Number(tipSelect.value) : 10;
    
    const tipUSD = (baseUSD * tipPercent) / 100;
    const totalUSD = baseUSD + tipUSD;

    const totalDisplay = document.getElementById("donate-total-display");
    if (totalDisplay) {
      totalDisplay.textContent = this.formatAmount(totalUSD);
    }
  }

  handleDonationSubmit(event) {
    event.preventDefault();
    if (!this.donationTargetCampaign) return;

    const baseUSD = this.getSelectedDonationBaseUSD();
    const tipSelect = document.getElementById("tip-select");
    const tipPercent = tipSelect ? Number(tipSelect.value) : 10;
    const tipUSD = (baseUSD * tipPercent) / 100;

    const donorName = document.getElementById("donor-name")?.value.trim();
    const donorEmail = document.getElementById("donor-email")?.value.trim();
    const donorMessage = document.getElementById("donor-message")?.value.trim();
    const isAnonymous = document.getElementById("donor-anonymous")?.checked || false;

    // Determine payment label
    let paymentMethodLabel = "Credit Card (•• 4242)";
    let cardLastFour = "4242";
    if (this.activePaymentMethod === "upi") {
      paymentMethodLabel = "UPI Direct Escrow (Ref: UPI-9921)";
      cardLastFour = "UPI";
    } else if (this.activePaymentMethod === "wallet") {
      paymentMethodLabel = "Apple Pay / Google Pay";
      cardLastFour = "WALLET";
    }

    // Show simulated 3-phase payment processing overlay
    const overlay = document.getElementById("payment-processing-overlay");
    const progressTitle = document.getElementById("processing-title");
    const progressSub = document.getElementById("processing-subtitle");
    const progressBar = document.getElementById("processing-progress-bar");

    if (overlay) {
      overlay.classList.remove("hidden");
      if (progressTitle) progressTitle.textContent = "Securing 256-bit SSL Connection...";
      if (progressSub) progressSub.textContent = `Connecting to ${this.donationTargetCampaign.hospital.split(',')[0]} Escrow Desk...`;
      if (progressBar) progressBar.style.width = "35%";
    }

    // Phase 1 -> Phase 2
    setTimeout(() => {
      if (progressTitle) progressTitle.textContent = "Clearing Direct Hospital Escrow...";
      if (progressSub) progressSub.textContent = "Anti-diversion protocols verified. Authorizing payment settlement...";
      if (progressBar) progressBar.style.width = "75%";

      // Phase 2 -> Phase 3 Completion
      setTimeout(() => {
        if (progressTitle) progressTitle.textContent = "Payment Cleared! Generating 80G Tax Receipt...";
        if (progressBar) progressBar.style.width = "100%";

        setTimeout(() => {
          try {
            const result = window.storage.recordDonation({
              campaignId: this.donationTargetCampaign.id,
              amount: Math.round(baseUSD),
              donorName,
              email: donorEmail,
              message: donorMessage,
              isAnonymous,
              tipAmount: Math.round(tipUSD),
              paymentMethod: paymentMethodLabel,
              cardLastFour
            });

            this.closeDonateModal();
            this.fireConfetti();
            this.showReceiptModal(result.receipt);

            this.renderCampaigns();
            this.renderUrgentCampaigns();
            this.updatePlatformStats();
            this.updateReceiptCount();

            this.showToast(`Thank you! Life-saving donation of ${this.formatAmount(baseUSD)} confirmed!`);
          } catch (e) {
            alert("Failed to record donation: " + e.message);
          }
        }, 600);

      }, 700);

    }, 700);
  }

  closeDonateModal() {
    const modal = document.getElementById("modal-donate");
    if (modal) modal.classList.add("hidden");
    const overlay = document.getElementById("payment-processing-overlay");
    if (overlay) overlay.classList.add("hidden");
    this.donationTargetCampaign = null;
  }

  fireConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  showReceiptModal(receipt) {
    const modal = document.getElementById("modal-receipt");
    if (!modal) return;

    document.getElementById("receipt-txn-id").textContent = receipt.transactionId;
    document.getElementById("receipt-patient").textContent = receipt.patientName;
    document.getElementById("receipt-hospital").textContent = receipt.hospital;
    document.getElementById("receipt-donor").textContent = receipt.donorName;
    const payMethodEl = document.getElementById("receipt-payment-method");
    if (payMethodEl) payMethodEl.textContent = receipt.paymentMethod || "Credit Card (•• 4242)";
    document.getElementById("receipt-date").textContent = new Date(receipt.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById("receipt-tax-code").textContent = receipt.taxExemptionCode;
    document.getElementById("receipt-amount").textContent = this.formatAmount(receipt.amount);

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeReceiptModal() {
    const modal = document.getElementById("modal-receipt");
    if (modal) modal.classList.add("hidden");
  }

  openAllReceiptsModal() {
    const modal = document.getElementById("modal-all-receipts");
    const container = document.getElementById("all-receipts-list");
    if (!modal || !container) return;

    const list = window.storage.getAllDonations();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400 text-xs">
          <i data-lucide="receipt" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
          <p>You haven't made any donations yet.</p>
        </div>
      `;
    } else {
      container.innerHTML = list.map(r => `
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-900">${r.patientName}</div>
            <div class="text-[11px] text-slate-400">${r.hospital} • ${new Date(r.date).toLocaleDateString()}</div>
            <div class="text-[10px] font-mono text-emerald-700">${r.taxExemptionCode}</div>
          </div>
          <div class="text-right">
            <span class="font-extrabold text-sm text-slate-900 block">${this.formatAmount(r.amount)}</span>
            <button onclick="app.showReceiptModal(${JSON.stringify(r).replace(/"/g, '&quot;')})" class="text-[11px] text-emerald-600 hover:underline font-bold">
              View Receipt
            </button>
          </div>
        </div>
      `).join("");
    }

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeAllReceiptsModal() {
    const modal = document.getElementById("modal-all-receipts");
    if (modal) modal.classList.add("hidden");
  }

  updateReceiptCount() {
    const countEl = document.getElementById("my-receipts-count");
    if (countEl) {
      countEl.textContent = window.storage.getAllDonations().length;
    }
  }

  // --- Partner Hospitals Directory Modal ---
  openHospitalsModal() {
    const modal = document.getElementById("modal-hospitals");
    const grid = document.getElementById("hospitals-directory-grid");
    if (!modal || !grid) return;

    const hospitals = window.storage.getPartnerHospitals();

    grid.innerHTML = hospitals.map(h => `
      <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
        <div class="flex items-start space-x-3">
          <img src="${h.image}" alt="${h.name}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm" onerror="this.src='https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=300&q=80'">
          <div>
            <h4 class="font-bold text-slate-900 text-sm leading-snug">${h.name}</h4>
            <div class="text-[11px] text-slate-500 flex items-center mt-0.5">
              <i data-lucide="map-pin" class="w-3 h-3 mr-1 text-slate-400"></i> ${h.city}
            </div>
            <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ${h.accreditation}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600">
          <div>
            <span class="text-slate-400 block">Bed Capacity:</span>
            <span class="font-bold text-slate-800">${h.bedCapacity} Total (${h.icuBeds} ICU)</span>
          </div>
          <div>
            <span class="text-slate-400 block">Escrow Desk:</span>
            <span class="font-mono text-emerald-700 text-[10px]">${h.escrowAccountRef}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-1 text-[10px]">
          ${h.specialties.map(s => `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">${s}</span>`).join("")}
        </div>
      </div>
    `).join("");

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeHospitalsModal() {
    const modal = document.getElementById("modal-hospitals");
    if (modal) modal.classList.add("hidden");
  }

  openHospitalOnboardingForm() {
    const modal = document.getElementById("modal-hospital-onboarding");
    if (modal) modal.classList.remove("hidden");
  }

  closeHospitalOnboardingForm() {
    const modal = document.getElementById("modal-hospital-onboarding");
    if (modal) modal.classList.add("hidden");
  }

  handleHospitalOnboardingSubmit(event) {
    event.preventDefault();
    const name = document.getElementById("onboard-hosp-name")?.value.trim();
    const city = document.getElementById("onboard-hosp-city")?.value.trim();
    const accreditation = document.getElementById("onboard-hosp-accred")?.value.trim();
    const bedCapacity = Number(document.getElementById("onboard-hosp-beds")?.value) || 200;
    const escrowAccountRef = document.getElementById("onboard-hosp-bank")?.value.trim();
    const email = document.getElementById("onboard-hosp-email")?.value.trim();

    window.storage.addHospitalApplication({
      name,
      city,
      accreditation,
      bedCapacity,
      escrowAccountRef,
      email
    });

    this.closeHospitalOnboardingForm();
    this.showToast("Hospital registration submitted to clinical advisory board!");
  }

  // --- Hospital Auditor Portal Modal ---
  openAuditorModal() {
    const modal = document.getElementById("modal-auditor");
    const container = document.getElementById("auditor-portal-content");
    if (!modal || !container) return;

    const campaigns = window.storage.getCampaigns();
    const stats = window.storage.getPlatformStats();
    const pendingList = campaigns.filter(c => !c.isVerified || c.verificationStatus?.includes("Pending"));
    const approvedList = campaigns.filter(c => c.isVerified);

    container.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <span class="text-slate-400 text-[11px] block">Total Cases</span>
          <span class="text-lg font-extrabold text-slate-900">${campaigns.length}</span>
        </div>
        <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
          <span class="text-amber-700 text-[11px] block font-bold">Pending Audit</span>
          <span class="text-lg font-extrabold text-amber-800">${pendingList.length}</span>
        </div>
        <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
          <span class="text-emerald-700 text-[11px] block font-bold">Approved & Verified</span>
          <span class="text-lg font-extrabold text-emerald-800">${approvedList.length}</span>
        </div>
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <span class="text-slate-400 text-[11px] block">Disbursements</span>
          <span class="text-lg font-extrabold text-indigo-700">${this.formatAmount(stats.totalRaised * 0.4)}</span>
        </div>
      </div>

      <div>
        <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
          Pending Clinical Review Queue (${pendingList.length})
        </h4>

        ${pendingList.length === 0 ? `
          <div class="p-4 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            All submitted campaigns are currently audited and verified!
          </div>
        ` : `
          <div class="space-y-3">
            ${pendingList.map(c => `
              <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 text-xs space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="font-extrabold text-slate-900 text-sm">${c.patientName} (${c.patientAge}y)</span>
                    <div class="text-[11px] text-slate-600 font-medium">${c.condition} • ${c.hospital}</div>
                    <div class="text-[10px] text-amber-800 italic mt-0.5">${c.verificationDetails?.auditorNotes || 'Awaiting document cross-verification'}</div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Needs Sign-off
                  </span>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-amber-200/70">
                  <span class="text-[11px] font-semibold text-slate-600">Goal: ${this.formatAmount(c.goalAmount)}</span>
                  <div class="flex space-x-2">
                    <button onclick="app.approveCampaignAsAuditor('${c.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm">
                      ✓ Approve & Verify
                    </button>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>

      <div class="pt-4 border-t border-slate-200">
        <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
          Execute Audited Hospital Payout Tranche
        </h4>
        <form onsubmit="app.handleDisbursementSubmit(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Select Case</label>
            <select id="disb-campaign-id" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" required>
              ${campaigns.map(c => `<option value="${c.id}">${c.patientName} (${c.hospital.split(',')[0]})</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tranche Purpose</label>
            <input type="text" id="disb-purpose" placeholder="e.g. ICU Bed Charges / Stents" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" required>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Amount ($ USD)</label>
            <input type="number" id="disb-amount" min="100" placeholder="e.g. 5000" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold" required>
          </div>
          <div class="flex items-end">
            <button type="submit" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm">
              Disburse to Hospital
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeAuditorModal() {
    const modal = document.getElementById("modal-auditor");
    if (modal) modal.classList.add("hidden");
  }

  approveCampaignAsAuditor(campaignId) {
    window.storage.updateCampaignVerification(campaignId, {
      isVerified: true,
      status: "Approved & Audited",
      auditorName: "Dr. Arvind Mehta (Chief Clinical Officer)",
      auditorNotes: "Clinical documents and hospital bed quota verified with administrative desk."
    });

    this.renderCampaigns();
    this.renderUrgentCampaigns();
    this.updateAuditorBadges();
    this.openAuditorModal();
    this.showToast("Campaign approved with official Hospital Verified badge!");
  }

  handleDisbursementSubmit(event) {
    event.preventDefault();
    const campaignId = document.getElementById("disb-campaign-id")?.value;
    const purpose = document.getElementById("disb-purpose")?.value.trim();
    const amount = Number(document.getElementById("disb-amount")?.value);

    if (!campaignId || !purpose || !amount) return;

    window.storage.recordDisbursement(campaignId, {
      purpose,
      amount,
      hospitalAccount: "HOSPITAL-AUDITED-ESCROW-2026",
      wireReference: "FEDWIRE-" + Math.floor(10000000 + Math.random() * 90000000)
    });

    this.openAuditorModal();
    this.showToast(`Tranche of ${this.formatAmount(amount)} wired directly to hospital!`);
  }

  updateAuditorBadges() {
    const pendingCount = window.storage.getPlatformStats().pendingReviewCount;
    const badge1 = document.getElementById("pending-audits-badge");
    const badge2 = document.getElementById("mobile-pending-badge");

    if (badge1) {
      badge1.textContent = pendingCount;
      badge1.classList.toggle("hidden", pendingCount === 0);
    }
    if (badge2) {
      badge2.textContent = `${pendingCount} Audit Cases`;
    }
  }

  // --- Post Clinical Update Modal ---
  openPostUpdateModal(campaignId) {
    this.postUpdateTargetCampaignId = campaignId;
    const modal = document.getElementById("modal-post-update");
    if (modal) modal.classList.remove("hidden");
  }

  closePostUpdateModal() {
    const modal = document.getElementById("modal-post-update");
    if (modal) modal.classList.add("hidden");
    this.postUpdateTargetCampaignId = null;
  }

  handlePostUpdateSubmit(event) {
    event.preventDefault();
    if (!this.postUpdateTargetCampaignId) return;

    const title = document.getElementById("update-title")?.value.trim();
    const authorRole = document.getElementById("update-author-role")?.value;
    const description = document.getElementById("update-desc")?.value.trim();

    if (!title || !description) return;

    window.storage.addCampaignUpdate(this.postUpdateTargetCampaignId, {
      title,
      authorRole,
      description
    });

    this.closePostUpdateModal();

    if (this.activeCampaignId === this.postUpdateTargetCampaignId) {
      this.openDetailModal(this.activeCampaignId, "updates");
    }

    this.showToast("Recovery update posted to campaign timeline!");
  }

  // --- Fundraiser Creation Multi-Step Wizard ---
  openCreateModal() {
    this.currentWizardStep = 1;
    this.goToWizardStep(1);
    const modal = document.getElementById("modal-create");
    if (modal) modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  closeCreateModal() {
    const modal = document.getElementById("modal-create");
    if (modal) modal.classList.add("hidden");
  }

  goToWizardStep(stepNum) {
    if (stepNum > this.currentWizardStep) {
      if (this.currentWizardStep === 1) {
        const name = document.getElementById("new-patient-name")?.value.trim();
        const age = document.getElementById("new-patient-age")?.value;
        const condition = document.getElementById("new-condition")?.value.trim();
        if (!name || !age || !condition) {
          alert("Please fill in patient name, age, and medical condition.");
          return;
        }
      } else if (this.currentWizardStep === 2) {
        const hospital = document.getElementById("new-hospital")?.value.trim();
        const goal = document.getElementById("new-goal")?.value;
        const days = document.getElementById("new-days")?.value;
        if (!hospital || !goal || !days) {
          alert("Please fill in hospital name, target goal, and days remaining.");
          return;
        }
      }
    }

    this.currentWizardStep = stepNum;

    document.getElementById("wizard-step-1")?.classList.toggle("hidden", stepNum !== 1);
    document.getElementById("wizard-step-2")?.classList.toggle("hidden", stepNum !== 2);
    document.getElementById("wizard-step-3")?.classList.toggle("hidden", stepNum !== 3);

    const ind1 = document.getElementById("step-ind-1");
    const ind2 = document.getElementById("step-ind-2");
    const ind3 = document.getElementById("step-ind-3");

    if (ind1) ind1.className = stepNum >= 1 ? "flex-1 h-1.5 rounded-full bg-emerald-500" : "flex-1 h-1.5 rounded-full bg-slate-700";
    if (ind2) ind2.className = stepNum >= 2 ? "flex-1 h-1.5 rounded-full bg-emerald-500" : "flex-1 h-1.5 rounded-full bg-slate-700";
    if (ind3) ind3.className = stepNum >= 3 ? "flex-1 h-1.5 rounded-full bg-emerald-500" : "flex-1 h-1.5 rounded-full bg-slate-700";

    if (window.lucide) window.lucide.createIcons();
  }

  handleCreateFundraiserSubmit(event) {
    event.preventDefault();

    const patientName = document.getElementById("new-patient-name")?.value.trim();
    const patientAge = Number(document.getElementById("new-patient-age")?.value);
    const gender = document.getElementById("new-patient-gender")?.value;
    const category = document.getElementById("new-category")?.value;
    const relationship = document.getElementById("new-relationship")?.value.trim();
    const condition = document.getElementById("new-condition")?.value.trim();
    const hospital = document.getElementById("new-hospital")?.value.trim();
    const doctorName = document.getElementById("new-doctor")?.value.trim() || "Lead Consultant";
    const city = document.getElementById("new-city")?.value.trim();
    const goalAmount = Number(document.getElementById("new-goal")?.value);
    const daysLeft = Number(document.getElementById("new-days")?.value);
    const isUrgent = document.getElementById("new-is-urgent")?.checked || false;
    const title = document.getElementById("new-title")?.value.trim();
    const story = document.getElementById("new-story")?.value.trim();
    let image = document.getElementById("new-image")?.value.trim();

    if (!image) {
      image = "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=900&q=80";
    }

    const newCampaign = window.storage.addCampaign({
      title,
      patientName,
      patientAge,
      gender,
      category,
      relationship,
      condition,
      hospital,
      doctorName,
      city,
      goalAmount,
      daysLeft,
      isUrgent,
      story,
      image,
      costBreakdown: [
        { item: "Emergency Treatment & Surgery", percentage: 55, amount: Math.round(goalAmount * 0.55) },
        { item: "Inpatient Bed & ICU Charges", percentage: 25, amount: Math.round(goalAmount * 0.25) },
        { item: "Specialized Medications & Care", percentage: 20, amount: Math.round(goalAmount * 0.20) }
      ]
    });

    this.closeCreateModal();
    this.renderCampaigns();
    this.renderUrgentCampaigns();
    this.updatePlatformStats();
    this.updateAuditorBadges();
    this.fireConfetti();

    this.showToast("Your fundraiser is now live with Verified Hospital Status!");
    
    setTimeout(() => {
      this.openDetailModal(newCampaign.id, "story");
    }, 600);
  }

  // --- Platform Stats Counter ---
  updatePlatformStats() {
    const stats = window.storage.getPlatformStats();
    const raisedEl = document.getElementById("stat-total-raised");
    const donorsEl = document.getElementById("stat-total-donors");
    const rateEl = document.getElementById("stat-verified-rate");

    if (raisedEl) raisedEl.textContent = this.formatAmount(stats.totalRaised);
    if (donorsEl) donorsEl.textContent = stats.totalDonors.toLocaleString() + "+";
    if (rateEl) rateEl.textContent = stats.verifiedRate + "%";
  }

  // --- Toast Notification ---
  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const msgEl = document.getElementById("toast-message");
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.remove("translate-y-24", "opacity-0");

    setTimeout(() => {
      toast.classList.add("translate-y-24", "opacity-0");
    }, 3500);
  }
}

// Instantiate and attach to window
window.addEventListener("DOMContentLoaded", () => {
  window.app = new MedicalFundApp();
});
