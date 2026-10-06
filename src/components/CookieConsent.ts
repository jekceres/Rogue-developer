import { i18n } from '../i18n/i18nManager';
import { CookiePreferences, TranslationDictionary } from '../types';

export class CookieConsent {
  private readonly STORAGE_KEY = 'rogue_portfolio_gdpr_consent';
  private bannerElement: HTMLElement | null = null;
  private modalElement: HTMLElement | null = null;
  private triggerElement: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.createBanner();
    this.createModal();
    this.createReopenTrigger();

    i18n.subscribe((_lang, dict) => {
      this.updateTranslations(dict);
    });

    const consent = this.getPreferences();
    if (!consent || !consent.consentGiven) {
      this.showBanner();
    }
  }

  public getPreferences(): CookiePreferences | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private savePreferences(prefs: Partial<CookiePreferences>): void {
    const current: CookiePreferences = {
      essential: true,
      functional: prefs.functional ?? false,
      consentGiven: true,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    } catch {
      // Ignore if localStorage unavailable
    }

    this.hideBanner();
    this.hideModal();
  }

  private createBanner(): void {
    this.bannerElement = document.createElement('section');
    this.bannerElement.id = 'gdpr-banner';
    this.bannerElement.className = 'gdpr-banner';
    this.bannerElement.setAttribute('role', 'region');
    this.bannerElement.setAttribute('aria-label', 'Cookie Consent Banner');

    this.bannerElement.innerHTML = `
      <div class="gdpr-content">
        <div class="gdpr-text-col">
          <div class="gdpr-badge-tag">
            <span class="gdpr-dot"></span>
            <span class="gdpr-badge-text">EU GDPR Compliant</span>
          </div>
          <h2 class="gdpr-title" id="gdpr-banner-title"></h2>
          <p class="gdpr-desc" id="gdpr-banner-desc"></p>
        </div>
        <div class="gdpr-actions">
          <button type="button" class="btn-gdpr btn-outline" id="gdpr-reject-btn"></button>
          <button type="button" class="btn-gdpr btn-subtle" id="gdpr-customize-btn"></button>
          <button type="button" class="btn-gdpr btn-solid" id="gdpr-accept-btn"></button>
        </div>
      </div>
    `;

    document.body.appendChild(this.bannerElement);

    const acceptBtn = this.bannerElement.querySelector('#gdpr-accept-btn');
    const rejectBtn = this.bannerElement.querySelector('#gdpr-reject-btn');
    const customBtn = this.bannerElement.querySelector('#gdpr-customize-btn');

    acceptBtn?.addEventListener('click', () => {
      this.savePreferences({ functional: true });
    });

    rejectBtn?.addEventListener('click', () => {
      this.savePreferences({ functional: false });
    });

    customBtn?.addEventListener('click', () => {
      this.showModal();
    });
  }

  private createModal(): void {
    this.modalElement = document.createElement('div');
    this.modalElement.id = 'gdpr-modal';
    this.modalElement.className = 'gdpr-modal-overlay';
    this.modalElement.setAttribute('role', 'dialog');
    this.modalElement.setAttribute('aria-modal', 'true');
    this.modalElement.setAttribute('aria-hidden', 'true');

    this.modalElement.innerHTML = `
      <div class="gdpr-modal-card">
        <div class="gdpr-modal-header">
          <h3 class="gdpr-modal-title" id="gdpr-modal-title"></h3>
          <button type="button" class="gdpr-modal-close" id="gdpr-modal-close-btn" aria-label="Close dialog">&times;</button>
        </div>
        <p class="gdpr-modal-desc" id="gdpr-modal-desc"></p>
        
        <div class="gdpr-options-list">
          <div class="gdpr-option-item">
            <div class="gdpr-option-info">
              <span class="gdpr-option-name" id="gdpr-essential-title"></span>
              <span class="gdpr-option-desc" id="gdpr-essential-desc"></span>
            </div>
            <span class="gdpr-status-tag" id="gdpr-essential-status"></span>
          </div>

          <div class="gdpr-option-item">
            <div class="gdpr-option-info">
              <span class="gdpr-option-name" id="gdpr-functional-title"></span>
              <span class="gdpr-option-desc" id="gdpr-functional-desc"></span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="gdpr-functional-toggle" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="gdpr-modal-footer">
          <button type="button" class="btn-gdpr btn-solid" id="gdpr-save-preferences-btn"></button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalElement);

    const closeBtn = this.modalElement.querySelector('#gdpr-modal-close-btn');
    const saveBtn = this.modalElement.querySelector('#gdpr-save-preferences-btn');
    const overlay = this.modalElement;

    closeBtn?.addEventListener('click', () => this.hideModal());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hideModal();
    });

    saveBtn?.addEventListener('click', () => {
      const functionalToggle = document.getElementById('gdpr-functional-toggle') as HTMLInputElement | null;
      this.savePreferences({
        functional: functionalToggle ? functionalToggle.checked : false,
      });
    });
  }

  private createReopenTrigger(): void {
    this.triggerElement = document.createElement('button');
    this.triggerElement.id = 'gdpr-reopen-trigger';
    this.triggerElement.className = 'gdpr-reopen-trigger';
    this.triggerElement.setAttribute('type', 'button');
    this.triggerElement.setAttribute('aria-label', 'Open Cookie Preferences');
    this.triggerElement.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>GDPR</span>
    `;

    this.triggerElement.addEventListener('click', () => {
      this.showModal();
    });

    document.body.appendChild(this.triggerElement);
  }

  private updateTranslations(dict: TranslationDictionary): void {
    const g = dict.gdpr;

    const bannerTitle = document.getElementById('gdpr-banner-title');
    const bannerDesc = document.getElementById('gdpr-banner-desc');
    const acceptBtn = document.getElementById('gdpr-accept-btn');
    const rejectBtn = document.getElementById('gdpr-reject-btn');
    const customBtn = document.getElementById('gdpr-customize-btn');

    if (bannerTitle) bannerTitle.textContent = g.title;
    if (bannerDesc) bannerDesc.textContent = g.description;
    if (acceptBtn) acceptBtn.textContent = g.acceptAll;
    if (rejectBtn) rejectBtn.textContent = g.rejectNonEssential;
    if (customBtn) customBtn.textContent = g.customize;

    const modalTitle = document.getElementById('gdpr-modal-title');
    const modalDesc = document.getElementById('gdpr-modal-desc');
    const essentialTitle = document.getElementById('gdpr-essential-title');
    const essentialDesc = document.getElementById('gdpr-essential-desc');
    const essentialStatus = document.getElementById('gdpr-essential-status');
    const functionalTitle = document.getElementById('gdpr-functional-title');
    const functionalDesc = document.getElementById('gdpr-functional-desc');
    const saveBtn = document.getElementById('gdpr-save-preferences-btn');

    if (modalTitle) modalTitle.textContent = g.modalTitle;
    if (modalDesc) modalDesc.textContent = g.modalDescription;
    if (essentialTitle) essentialTitle.textContent = g.essentialTitle;
    if (essentialDesc) essentialDesc.textContent = g.essentialDesc;
    if (essentialStatus) essentialStatus.textContent = g.essentialStatus;
    if (functionalTitle) functionalTitle.textContent = g.functionalTitle;
    if (functionalDesc) functionalDesc.textContent = g.functionalDesc;
    if (saveBtn) saveBtn.textContent = g.save;
  }

  private showBanner(): void {
    this.bannerElement?.classList.add('visible');
  }

  private hideBanner(): void {
    this.bannerElement?.classList.remove('visible');
  }

  public showModal(): void {
    const prefs = this.getPreferences();
    const functionalToggle = document.getElementById('gdpr-functional-toggle') as HTMLInputElement | null;
    if (functionalToggle) {
      functionalToggle.checked = prefs?.functional ?? false;
    }

    this.modalElement?.classList.add('visible');
    this.modalElement?.setAttribute('aria-hidden', 'false');
  }

  public hideModal(): void {
    this.modalElement?.classList.remove('visible');
    this.modalElement?.setAttribute('aria-hidden', 'true');
  }
}
