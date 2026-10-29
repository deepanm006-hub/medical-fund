/**
 * Main Application Logic for Medical Fund
 */

class MedicalFundApp {
  constructor() {
    this.activeCategory = "all";
    this.searchQuery = "";
    this.sortOption = "urgent";
    this.activeCampaignId = null;
    this.donationTargetCampaign = null;
    this.currentWizardStep = 1;

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

    // Initialize Event Listeners
    this.initEventListeners();

    // Render components
    this.renderCategoryPills();
    this.renderCampaigns();
    this.renderUrgentCampaigns();
    this.updatePlatformStats();
    this.updateReceiptCount();

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
      this.openDetailModal(this.activeCampaignId);
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

    // Start a Fundraiser Open Button
    const btnOpenCreate = document.getElementById("btn-open-create");
    if (btnOpenCreate) {
      btnOpenCreate.addEventListener("click", () => this.openCreateModal());
    }

    // Receipts Button
    const btnReceipts = document.getElementById("btn-view-receipts");
    if (btnReceipts) {
      btnReceipts.addEventListener("click", () => this.openAllReceiptsModal());
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
        // Deselect presets
        document.querySelectorAll(".preset-amount-btn").forEach(b => b.classList.remove("border-brand-600", "bg-brand-50", "text-brand-700"));
        this.calculateDonationTotal();
      });
    }

    // Create Fundraiser Form Submit
    const createForm = document.getElementById("create-fundraiser-form");
    if (createForm) {
      createForm.addEventListener("submit", (e) => this.handleCreateFundraiserSubmit(e));
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
    
    // Scroll smoothly to campaigns section
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

    // Category filter
    if (this.activeCategory === "urgent") {
      list = list.filter(c => c.isUrgent);
    } else if (this.activeCategory !== "all") {
      list = list.filter(c => c.category === this.activeCategory);
    }

    // Search query filter
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

    // Sorting
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
    const borderStyle = campaign.isUrgent 
      ? "border-rose-200 hover:border-rose-300 shadow-sm hover:shadow-md" 
      : "border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md";

    return `
      <div class="bg-white rounded-3xl overflow-hidden border ${borderStyle} flex flex-col transition-all duration-300 hover:-translate-y-1 group">
        
        <!-- Image & Tags Overlay -->
        <div class="relative h-52 w-full overflow-hidden bg-slate-100">
          <img 
            src="${campaign.image}" 
            alt="${campaign.title}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onerror="this.src='https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20"></div>

          <!-- Category Pill -->
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            ${campaign.category}
          </span>

          <!-- Urgent Countdown Badge -->
          ${campaign.isUrgent ? `
            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-md flex items-center space-x-1 urgent-badge-glow">
              <i data-lucide="flame" class="w-3 h-3"></i>
              <span>${campaign.daysLeft} days left</span>
            </span>
          ` : `
            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/70 text-slate-200 backdrop-blur-sm flex items-center space-x-1">
              <i data-lucide="clock" class="w-3 h-3"></i>
              <span>${campaign.daysLeft} days left</span>
            </span>
          `}

          <!-- Hospital Badge on Image Bottom -->
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <span class="flex items-center text-emerald-300 font-bold truncate max-w-[200px]">
              <i data-lucide="shield-check" class="w-4 h-4 mr-1 flex-shrink-0"></i>
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
            <span class="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">Audited</span>
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
                Story
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

  // --- Campaign Detail Modal ---
  openDetailModal(campaignId) {
    this.activeCampaignId = campaignId;
    const campaign = window.storage.getCampaignById(campaignId);
    if (!campaign) return;

    const modal = document.getElementById("modal-detail");
    const body = document.getElementById("detail-modal-body");
    if (!modal || !body) return;

    const percent = Math.min(Math.round((campaign.raisedAmount / campaign.goalAmount) * 100), 100);

    body.innerHTML = `
      <!-- Hero Image Header -->
      <div class="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-900">
        <img src="${campaign.image}" alt="${campaign.title}" class="w-full h-full object-cover opacity-90">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div class="absolute bottom-6 left-6 right-6 text-white">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-600 text-white">${campaign.category}</span>
            ${campaign.isUrgent ? `<span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center"><i data-lucide="flame" class="w-3 h-3 mr-1"></i>Urgent Case</span>` : ''}
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-emerald-300 flex items-center">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 mr-1"></i>Hospital Verified
            </span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white leading-tight">${campaign.title}</h2>
        </div>
      </div>

      <!-- Main Modal Content -->
      <div class="p-6 sm:p-8 space-y-8">

        <!-- Top Overview Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left 2 Cols: Details, Clinical Verification & Story -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Patient & Clinical Info Pill Matrix -->
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

            <!-- Verified Medical Badges -->
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
              <div class="flex items-center space-x-2 text-[11px] font-bold text-emerald-800">
                <span class="bg-white px-2.5 py-1 rounded-lg border border-emerald-200">Doctor Note ✓</span>
                <span class="bg-white px-2.5 py-1 rounded-lg border border-emerald-200">ICU Estimate ✓</span>
              </div>
            </div>

            <!-- Story Body -->
            <div>
              <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Patient Story & Appeal</h4>
              <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                ${campaign.story}
              </div>
            </div>

            <!-- Cost Breakdown -->
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

            <!-- Medical Recovery Updates -->
            <div>
              <h4 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Clinical Updates (${(campaign.updates || []).length})</h4>
              <div class="space-y-3">
                ${(campaign.updates || []).map(u => `
                  <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div class="flex items-center justify-between text-slate-400 mb-1">
                      <span class="font-bold text-slate-800">${u.title}</span>
                      <span>${u.date}</span>
                    </div>
                    <p class="text-slate-600">${u.description}</p>
                  </div>
                `).join("")}
              </div>
            </div>

          </div>

          <!-- Right 1 Col: Floating Action Card & Donors List -->
          <div class="space-y-6">
            
            <!-- Sticky Action Box -->
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

              <div class="text-[11px] text-slate-500 text-center space-y-1">
                <p>✓ 100% Tax Deductible (80G / 501c3)</p>
                <p>✓ Disbursed directly to hospital account</p>
              </div>

              <!-- Recent Donors Board -->
              <div class="pt-4 border-t border-slate-200">
                <h5 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Supporters (${(campaign.donors || []).length})</h5>
                <div class="space-y-3 max-h-56 overflow-y-auto pr-1">
                  ${(campaign.donors || []).length === 0 ? `
                    <p class="text-xs text-slate-400">Be the first to donate and leave an encouraging message!</p>
                  ` : (campaign.donors || []).map(d => `
                    <div class="text-xs pb-2 border-b border-slate-100 last:border-0">
                      <div class="flex justify-between items-center font-bold text-slate-800">
                        <span>${d.name}</span>
                        <span class="text-emerald-700">${this.formatAmount(d.amount)}</span>
                      </div>
                      ${d.message ? `<p class="text-[11px] text-slate-500 italic mt-0.5">"${d.message}"</p>` : ''}
                      <span class="text-[10px] text-slate-400">${d.time}</span>
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

  closeDetailModal() {
    const modal = document.getElementById("modal-detail");
    if (modal) modal.classList.add("hidden");
    this.activeCampaignId = null;
  }

  // --- Donation Modal ---
  openDonateModal(campaignId) {
    const campaign = window.storage.getCampaignById(campaignId);
    if (!campaign) return;

    this.donationTargetCampaign = campaign;

    const modal = document.getElementById("modal-donate");
    const titleEl = document.getElementById("donate-modal-title");
    const patientEl = document.getElementById("donate-modal-patient");

    if (titleEl) titleEl.textContent = `Donate to ${campaign.title}`;
    if (patientEl) patientEl.textContent = `Beneficiary: ${campaign.patientName} • ${campaign.hospital}`;

    this.setupDonationPresets();
    this.calculateDonationTotal();

    if (modal) modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  setupDonationPresets() {
    const curr = window.storage.getCurrency();
    const config = CURRENCIES[curr] || CURRENCIES.USD;
    
    // Set currency symbol in input
    const symbolEl = document.getElementById("donate-currency-symbol");
    if (symbolEl) symbolEl.textContent = config.symbol;

    // Presets in USD base: 25, 50, 100, 250
    const baseAmounts = [25, 50, 100, 250];
    const grid = document.getElementById("preset-amounts-grid");
    if (!grid) return;

    grid.innerHTML = baseAmounts.map((base, idx) => {
      const converted = Math.round(base * config.rate);
      const isDefault = idx === 1; // 50 is default
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
      // Converted back to USD
      return Number(customInput.value) / config.rate;
    }

    const activePreset = document.querySelector(".preset-amount-btn.bg-brand-50");
    if (activePreset) {
      return Number(activePreset.dataset.amount);
    }

    return 50; // default $50
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

    try {
      const result = window.storage.recordDonation({
        campaignId: this.donationTargetCampaign.id,
        amount: Math.round(baseUSD),
        donorName,
        email: donorEmail,
        message: donorMessage,
        isAnonymous,
        tipAmount: Math.round(tipUSD)
      });

      // Close Donate Modal
      this.closeDonateModal();

      // Trigger Confetti!
      this.fireConfetti();

      // Show Tax Receipt Modal
      this.showReceiptModal(result.receipt);

      // Re-render
      this.renderCampaigns();
      this.renderUrgentCampaigns();
      this.updatePlatformStats();
      this.updateReceiptCount();

      this.showToast(`Thank you! Donation of ${this.formatAmount(baseUSD)} received!`);
    } catch (e) {
      alert("Failed to record donation: " + e.message);
    }
  }

  closeDonateModal() {
    const modal = document.getElementById("modal-donate");
    if (modal) modal.classList.add("hidden");
    this.donationTargetCampaign = null;
  }

  // --- Confetti Celebration ---
  fireConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // --- Receipt Modal ---
  showReceiptModal(receipt) {
    const modal = document.getElementById("modal-receipt");
    if (!modal) return;

    document.getElementById("receipt-txn-id").textContent = receipt.transactionId;
    document.getElementById("receipt-patient").textContent = receipt.patientName;
    document.getElementById("receipt-hospital").textContent = receipt.hospital;
    document.getElementById("receipt-donor").textContent = receipt.donorName;
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

  // --- All User Receipts Modal ---
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
    // Validate current step before proceeding forward
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

    // Toggle steps
    document.getElementById("wizard-step-1")?.classList.toggle("hidden", stepNum !== 1);
    document.getElementById("wizard-step-2")?.classList.toggle("hidden", stepNum !== 2);
    document.getElementById("wizard-step-3")?.classList.toggle("hidden", stepNum !== 3);

    // Indicator bars
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
      // Default medical relief photo
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
    this.fireConfetti();

    this.showToast("Your fundraiser is now live with Verified Hospital Status!");
    
    // Automatically open detail view of the new campaign
    setTimeout(() => {
      this.openDetailModal(newCampaign.id);
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
