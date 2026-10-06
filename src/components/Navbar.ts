import { i18n } from '../i18n/i18nManager';
import { SupportedLanguage, TranslationDictionary } from '../types';

export class Navbar {
  private navElement: HTMLElement;
  private isDropdownOpen: boolean = false;

  constructor(navElement: HTMLElement) {
    this.navElement = navElement;
    this.init();
  }

  private init(): void {
    this.render();
    this.bindEvents();

    i18n.subscribe((lang, dict) => {
      this.updateTranslations(lang, dict);
    });
  }

  private render(): void {
    this.navElement.innerHTML = `
      <div class="nav-container">
        <a href="#heroSection" class="nav-brand" id="navBrandLink" aria-label="Home / Hero Section">
          <span class="brand-monogram">R</span>
          <span class="brand-title" id="nav-brand-title">Rogue Developer</span>
        </a>

        <div class="nav-center-menu">
          <a href="#storytellingSection" class="nav-link" id="nav-services-link">Services</a>
          <a href="#portfolioUniverseSection" class="nav-link" id="nav-portfolio-link">Portfolio</a>
          <a href="#whoIAmSection" class="nav-link" id="nav-who-i-am-link">About me</a>
          <a href="#contactSection" class="nav-link" id="nav-contact-link">Contact</a>
        </div>

        <div class="nav-right-actions">
          <div class="lang-dropdown-wrapper">
            <button type="button" class="lang-selector-btn" id="langSelectorBtn" aria-expanded="false" aria-haspopup="listbox" aria-label="Select Language">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="globe-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span class="active-lang-code" id="activeLangCode">EN</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <ul class="lang-dropdown-menu" id="langDropdownMenu" role="listbox" tabindex="-1">
              <li class="lang-option" role="option" data-lang="en">
                <span class="flag-icon">🇺🇸</span>
                <span class="lang-name">English</span>
                <span class="lang-tag">EN</span>
              </li>
              <li class="lang-option" role="option" data-lang="es">
                <span class="flag-icon">🇪🇸</span>
                <span class="lang-name">Español</span>
                <span class="lang-tag">ES</span>
              </li>
              <li class="lang-option" role="option" data-lang="fr">
                <span class="flag-icon">🇫🇷</span>
                <span class="lang-name">Français</span>
                <span class="lang-tag">FR</span>
              </li>
              <li class="lang-option" role="option" data-lang="pt">
                <span class="flag-icon">🇧🇷</span>
                <span class="lang-name">Português</span>
                <span class="lang-tag">PT</span>
              </li>
            </ul>
          </div>

          <a href="#contactSection" class="btn-nav-cta" id="nav-cta-btn">Connect</a>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    const selectorBtn = this.navElement.querySelector('#langSelectorBtn') as HTMLButtonElement | null;
    const langOptions = this.navElement.querySelectorAll('.lang-option');

    selectorBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown(!this.isDropdownOpen);
    });

    langOptions.forEach((option) => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = option as HTMLElement;
        const lang = target.getAttribute('data-lang') as SupportedLanguage | null;
        if (lang) {
          i18n.setLanguage(lang);
          this.toggleDropdown(false);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (this.isDropdownOpen && !this.navElement.contains(e.target as Node)) {
        this.toggleDropdown(false);
      }
    });

    const handleScroll = () => {
      if (window.scrollY > 40) {
        this.navElement.classList.add('scrolled');
      } else {
        this.navElement.classList.remove('scrolled');
      }
    };

    // Smooth scrolling for nav anchor links
    const navLinks = this.navElement.querySelectorAll('.nav-link, .btn-nav-cta, .nav-brand');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          if (href === '#hero' || href === '#heroSection' || link.classList.contains('nav-brand') || link.id === 'navBrandLink') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          } else if (href === '#contactSection' || href === '#contact') {
            const cta = document.getElementById('portfolioCtaBtn') || document.querySelector('.portfolio-cta-block');
            if (cta) cta.scrollIntoView({ behavior: 'smooth' });
          } else if (href === '#whoIAmSection') {
            const portfolio = document.getElementById('portfolioUniverseSection');
            if (portfolio) {
              const rect = portfolio.getBoundingClientRect();
              window.scrollTo({ top: window.scrollY + rect.bottom, behavior: 'smooth' });
            }
          }
        }
      });
    });

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private toggleDropdown(open: boolean): void {
    this.isDropdownOpen = open;
    const selectorBtn = this.navElement.querySelector('#langSelectorBtn');
    const dropdownMenu = this.navElement.querySelector('#langDropdownMenu');

    selectorBtn?.setAttribute('aria-expanded', String(open));
    if (open) {
      dropdownMenu?.classList.add('visible');
    } else {
      dropdownMenu?.classList.remove('visible');
    }
  }

  private updateTranslations(currentLang: SupportedLanguage, dict: TranslationDictionary): void {
    const brand = this.navElement.querySelector('#nav-brand-title');
    const services = this.navElement.querySelector('#nav-services-link');
    const portfolio = this.navElement.querySelector('#nav-portfolio-link');
    const whoIAm = this.navElement.querySelector('#nav-who-i-am-link');
    const contact = this.navElement.querySelector('#nav-contact-link');
    const activeCode = this.navElement.querySelector('#activeLangCode');
    const ctaBtn = this.navElement.querySelector('#nav-cta-btn');

    if (brand) brand.textContent = dict.nav.brand;
    if (services) services.textContent = dict.nav.services;
    if (portfolio) portfolio.textContent = dict.nav.portfolio;
    if (whoIAm) whoIAm.textContent = dict.nav.whoIAm;
    if (contact) contact.textContent = dict.nav.contact;
    if (activeCode) activeCode.textContent = currentLang.toUpperCase();
    if (ctaBtn) ctaBtn.textContent = dict.hero.ctaContact;

    // Update active highlight in dropdown
    const langOptions = this.navElement.querySelectorAll('.lang-option');
    langOptions.forEach((opt) => {
      const code = opt.getAttribute('data-lang');
      if (code === currentLang) {
        opt.classList.add('active');
        opt.setAttribute('aria-selected', 'true');
      } else {
        opt.classList.remove('active');
        opt.setAttribute('aria-selected', 'false');
      }
    });
  }
}
