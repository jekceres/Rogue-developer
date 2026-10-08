import { i18n } from '../i18n/i18nManager';
import { TranslationDictionary } from '../types';

interface Star3D {
  x: number;
  y: number;
  z: number;
  radius: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  colorType: 'white' | 'cyan' | 'gold';
  hasSpikes: boolean;
}

export class ContactSection {
  private sectionElement: HTMLElement;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stars: Star3D[] = [];
  private readonly STAR_COUNT = 440;
  private animFrameId: number | null = null;
  private isVisible: boolean = false;

  private canvasWidth = window.innerWidth;
  private canvasHeight = window.innerHeight;

  private mouseX = 0;
  private mouseY = 0;
  private cameraX = 0;
  private cameraY = 0;
  private targetCameraX = 0;
  private targetCameraY = 0;

  private scrollProgress = 0;
  private readonly WHATSAPP_PHONE = '584242905469';

  // Selected service state
  private selectedServiceKey: 'info' | 'ecom' | 'apps' | 'custom' = 'custom';

  private onResizeHandler: (() => void) | null = null;
  private onMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private onScrollHandler: (() => void) | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(sectionElement: HTMLElement) {
    this.sectionElement = sectionElement;
    this.init();
  }

  private init(): void {
    // Read any pre-selected service from storage
    try {
      const saved = localStorage.getItem('rogue_selected_service') as 'info' | 'ecom' | 'apps' | null;
      if (saved && ['info', 'ecom', 'apps'].includes(saved)) {
        this.selectedServiceKey = saved;
      }
    } catch {}

    this.render();
    this.initStarfield();
    this.bindEvents();

    i18n.subscribe((_lang, dict) => {
      this.updateTranslations(dict);
    });

    this.updateTranslations(i18n.getDictionary());
    this.startLoop();
  }

  private render(): void {
    const dict = i18n.getDictionary();
    const t = dict.contact;

    this.sectionElement.innerHTML = `
      <!-- Fixed Continuous Cosmos Canvas -->
      <canvas class="contact-starfield-canvas" id="contactStarfieldCanvas" aria-hidden="true"></canvas>

      <!-- Ambient Nebular Atmosphere -->
      <div class="contact-ambient-grid" aria-hidden="true"></div>
      <div class="contact-glow contact-glow-1" aria-hidden="true"></div>
      <div class="contact-glow contact-glow-2" aria-hidden="true"></div>

      <div class="contact-inner">
        <!-- Section Header with Unified H2 & Floating Physics -->
        <header class="contact-header">
          <div class="contact-tag-badge">
            <span class="contact-pulse-dot"></span>
            <span class="contact-badge-text" id="contactTagBadge">${t.tag}</span>
          </div>
          <h2 class="section-heading-3d contact-title" id="contactTitle">
            ${t.title}
          </h2>
          <p class="contact-subtitle" id="contactSubtitle">
            ${t.subtitle}
          </p>
        </header>

        <!-- Direct Contact Action Cards: WhatsApp (Hero Priority) + Email Dispatch -->
        <div class="contact-direct-channels">
          <!-- Card 1: WhatsApp Priority Channel (No plain phone number shown) -->
          <a 
            href="https://wa.me/${this.WHATSAPP_PHONE}?text=${encodeURIComponent('Hello Jesús! I would like to get in touch with you to discuss a project.')}" 
            class="channel-card channel-whatsapp" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Open direct WhatsApp conversation"
          >
            <div class="channel-card-glow wa-glow" aria-hidden="true"></div>
            <div class="channel-card-body">
              <div class="channel-icon-wrap wa-icon-wrap">
                <svg class="channel-icon-svg wa-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <div class="channel-info">
                <span class="channel-kicker wa-kicker" id="contactWaLabel">${t.whatsAppLabel}</span>
                <span class="channel-headline" id="contactWaHeadline">${t.whatsAppHeadline}</span>
                <span class="channel-subtext" id="contactWaSubtext">${t.whatsAppSubtext}</span>
              </div>
            </div>
            <div class="channel-action-badge wa-action-badge">
              <span id="contactWaBtnText">${t.whatsAppBtnText}</span>
              <span class="channel-arrow">→</span>
            </div>
          </a>

          <!-- Card 2: Email Dispatch Channel -->
          <a 
            href="mailto:jekceres@gmail.com" 
            class="channel-card channel-email" 
            aria-label="Send direct email"
          >
            <div class="channel-card-glow mail-glow" aria-hidden="true"></div>
            <div class="channel-card-body">
              <div class="channel-icon-wrap mail-icon-wrap">
                <svg class="channel-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </div>
              <div class="channel-info">
                <span class="channel-kicker mail-kicker" id="contactEmailLabel">${t.emailLabel}</span>
                <span class="channel-headline channel-email-value">jekceres@gmail.com</span>
                <span class="channel-subtext" id="contactEmailSubtext">${t.emailSubtext}</span>
              </div>
            </div>
            <div class="channel-action-badge mail-action-badge">
              <span id="contactEmailBtnText">${t.emailBtnText}</span>
              <span class="channel-arrow">→</span>
            </div>
          </a>
        </div>

        <!-- High-Impact Subspace Communication Terminal Form -->
        <div class="contact-terminal-frame" id="contactTerminalFrame">
          <div class="terminal-top-hud">
            <div class="terminal-hud-left">
              <span class="hud-dot hud-dot-green"></span>
              <span class="hud-dot hud-dot-white"></span>
              <span class="hud-dot hud-dot-gray"></span>
              <span class="terminal-hud-title">SUBSPACE_UPLINK // WHATSAPP_ROUTED</span>
            </div>
            <div class="terminal-hud-telemetry">
              <span class="terminal-bracket">[</span>
              <span class="terminal-status-text">CHANNEL: ENCRYPTED // DESTINATION: VERIFIED_UPLINK</span>
              <span class="terminal-bracket">]</span>
            </div>
          </div>

          <div class="terminal-content-grid">
            <!-- Left Column: Active Directive (Selected Service from Section 2) & Preview -->
            <div class="terminal-directive-col">
              <div class="directive-kicker-group">
                <span class="directive-pill">// DIRECTIVE STATUS</span>
                <span class="directive-live">ACTIVE</span>
              </div>
              <h3 class="directive-title" id="contactFormTitle">${t.formTitle}</h3>
              <p class="directive-desc" id="contactFormSubtitle">${t.formSubtitle}</p>

              <!-- Dynamic Service Selection Telemetry Box -->
              <div class="service-selection-box" id="serviceSelectionBox">
                <div class="service-box-header">
                  <span class="service-box-dot"></span>
                  <span class="service-box-label" id="contactSelectedServiceTitle">${t.selectedServiceTitle}</span>
                </div>
                <div class="service-active-card" id="serviceActiveCard">
                  <div class="service-card-tag" id="serviceCardTag">SELECTED ARCHITECTURE</div>
                  <h4 class="service-card-name" id="serviceCardName">
                    ${this.getServiceTitle(this.selectedServiceKey, t)}
                  </h4>
                  <p class="service-card-hint" id="serviceCardHint">
                    ${this.selectedServiceKey !== 'custom' 
                      ? 'Loaded directly from Services section.' 
                      : t.noServiceSelected}
                  </p>
                </div>

                <!-- Interactive Chips to change service right here in the form -->
                <div class="service-chips-selector">
                  <span class="chips-label" id="contactServiceCatLabel">${t.serviceCategoryLabel}:</span>
                  <div class="chips-list" role="radiogroup" aria-label="Service Selector">
                    <button type="button" class="service-select-chip ${this.selectedServiceKey === 'info' ? 'active' : ''}" data-key="info">
                      ${t.servicesOptions.info}
                    </button>
                    <button type="button" class="service-select-chip ${this.selectedServiceKey === 'ecom' ? 'active' : ''}" data-key="ecom">
                      ${t.servicesOptions.ecom}
                    </button>
                    <button type="button" class="service-select-chip ${this.selectedServiceKey === 'apps' ? 'active' : ''}" data-key="apps">
                      ${t.servicesOptions.apps}
                    </button>
                    <button type="button" class="service-select-chip ${this.selectedServiceKey === 'custom' ? 'active' : ''}" data-key="custom">
                      ${t.servicesOptions.custom}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Transmission Live Telemetry Readout -->
              <div class="telemetry-readout-card">
                <span class="readout-header">// TELEMETRY PROTOCOL</span>
                <span class="readout-line">ROUTE: DIRECT CLIENT ──► WHATSAPP API</span>
                <span class="readout-line">PAYLOAD: UTF-8 ENCODED MISSION BRIEF</span>
                <span class="readout-line">DISPATCH TIME: IMMEDIATE</span>
              </div>
            </div>

            <!-- Right Column: Interactive Form Fields -->
            <div class="terminal-form-col">
              <form class="contact-transmission-form" id="contactTransmissionForm" novalidate>
                <!-- Field: Operator Name -->
                <div class="form-field-group">
                  <label for="contactSenderName" class="form-field-label" id="contactNameLabel">
                    ${t.nameLabel} <span class="required-mark">*</span>
                  </label>
                  <div class="form-input-wrap">
                    <input 
                      type="text" 
                      id="contactSenderName" 
                      name="senderName" 
                      class="terminal-input" 
                      placeholder="${t.namePlaceholder}" 
                      required 
                      autocomplete="name" 
                      minlength="2"
                    />
                    <span class="input-focus-line"></span>
                  </div>
                </div>

                <!-- Field: Contact Method -->
                <div class="form-field-group">
                  <label for="contactSenderEmail" class="form-field-label" id="contactEmailInputLabel">
                    ${t.contactLabel} <span class="required-mark">*</span>
                  </label>
                  <div class="form-input-wrap">
                    <input 
                      type="text" 
                      id="contactSenderEmail" 
                      name="senderContact" 
                      class="terminal-input" 
                      placeholder="${t.contactPlaceholder}" 
                      required 
                      autocomplete="email" 
                      minlength="3"
                    />
                    <span class="input-focus-line"></span>
                  </div>
                </div>

                <!-- Field: Project Message / Scope -->
                <div class="form-field-group">
                  <label for="contactMessage" class="form-field-label" id="contactMessageLabel">
                    ${t.messageLabel} <span class="required-mark">*</span>
                  </label>
                  <div class="form-input-wrap">
                    <textarea 
                      id="contactMessage" 
                      name="message" 
                      class="terminal-textarea" 
                      placeholder="${t.messagePlaceholder}" 
                      rows="4" 
                      required 
                      minlength="5"
                    ></textarea>
                    <span class="input-focus-line"></span>
                  </div>
                </div>

                <!-- Form Submit Action -->
                <div class="form-actions-wrap">
                  <button type="submit" class="btn-transmit-wa" id="btnTransmitWa">
                    <!-- WhatsApp Icon SVG with White Border and White Handset (matching Services section format) -->
                    <svg class="wa-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <!-- Outer speech bubble border in white -->
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <!-- Inner telephone handset in white -->
                      <path d="M17.47 14.39C17.19 14.25 15.84 13.59 15.59 13.49C15.34 13.4 15.15 13.35 14.97 13.63C14.78 13.91 14.25 14.53 14.09 14.72C13.93 14.91 13.77 14.93 13.5 14.79C13.22 14.65 12.32 14.36 11.26 13.41C10.43 12.67 9.87 11.76 9.71 11.48C9.55 11.2 9.69 11.05 9.83 10.91C9.96 10.78 10.11 10.59 10.24 10.42C10.38 10.26 10.43 10.14 10.52 9.96C10.61 9.77 10.57 9.61 10.5 9.47C10.43 9.33 9.88 7.97 9.65 7.41C9.42 6.87 9.19 6.94 9.03 6.93C8.87 6.92 8.68 6.92 8.49 6.92C8.3 6.92 8 6.99 7.74 7.27C7.49 7.55 6.76 8.23 6.76 9.6C6.76 10.98 7.76 12.31 7.9 12.5C8.04 12.69 9.88 15.52 12.69 16.73C15.5 17.94 15.5 17.54 16.01 17.49C16.52 17.44 17.64 16.82 17.87 16.18C18.1 15.53 18.1 14.98 18.03 14.87C17.96 14.75 17.75 14.53 17.47 14.39Z" fill="#ffffff"/>
                    </svg>
                    <span class="btn-transmit-text" id="contactSubmitBtnText">${t.submitBtnText}</span>
                  </button>
                  <p class="form-disclaimer" id="contactSubmitHint">${t.submitHint}</p>
                </div>

                <!-- Interactive Toast / Status Feedback -->
                <div class="form-status-feedback" id="formStatusFeedback" role="status" aria-live="polite"></div>
              </form>
            </div>
          </div>

          <!-- Terminal Bottom Decal -->
          <div class="terminal-bottom-decal">
            <span class="decal-hash">///</span>
            <span>SECURE COMM TERMINAL · ROGUE ARCHITECTURE · READY TO TRANSMIT</span>
            <span class="decal-hash">///</span>
          </div>
        </div>
      </div>
    `;
  }

  private getServiceTitle(key: 'info' | 'ecom' | 'apps' | 'custom', t: TranslationDictionary['contact']): string {
    switch (key) {
      case 'info':
        return t.servicesOptions.info;
      case 'ecom':
        return t.servicesOptions.ecom;
      case 'apps':
        return t.servicesOptions.apps;
      case 'custom':
      default:
        return t.servicesOptions.custom;
    }
  }

  private bindEvents(): void {
    // 1. Listen for service selected in Section 2 (Services)
    window.addEventListener('rogue:service-selected', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.key) {
        this.selectedServiceKey = detail.key;
      } else {
        this.selectedServiceKey = 'custom';
      }
      this.updateServiceSelectionDisplay();
    });

    // 2. Chips clicks inside this form
    const chips = this.sectionElement.querySelectorAll('.service-select-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.getAttribute('data-key') as 'info' | 'ecom' | 'apps' | 'custom';
        if (key) {
          this.selectedServiceKey = key;
          try {
            if (key !== 'custom') {
              localStorage.setItem('rogue_selected_service', key);
            } else {
              localStorage.removeItem('rogue_selected_service');
            }
          } catch {}

          this.updateServiceSelectionDisplay();

          // Sync back to Section 2 if it's one of the 3 main services
          window.dispatchEvent(new CustomEvent('rogue:service-selected', {
            detail: {
              key: key !== 'custom' ? key : null,
              title: null,
              waMessage: null
            }
          }));
        }
      });
    });

    // 3. Form Submission -> WhatsApp
    const form = this.sectionElement.querySelector('#contactTransmissionForm') as HTMLFormElement | null;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(form);
    });
  }

  private updateServiceSelectionDisplay(): void {
    const dict = i18n.getDictionary();
    const t = dict.contact;

    const chips = this.sectionElement.querySelectorAll('.service-select-chip');
    chips.forEach((c) => {
      if (c.getAttribute('data-key') === this.selectedServiceKey) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const cardName = this.sectionElement.querySelector('#serviceCardName');
    const cardHint = this.sectionElement.querySelector('#serviceCardHint');

    if (cardName) {
      cardName.textContent = this.getServiceTitle(this.selectedServiceKey, t);
    }
    if (cardHint) {
      cardHint.textContent = this.selectedServiceKey !== 'custom'
        ? 'Loaded directly from Services section.'
        : t.noServiceSelected;
    }
  }

  private handleFormSubmit(form: HTMLFormElement): void {
    const nameInput = form.querySelector('#contactSenderName') as HTMLInputElement | null;
    const contactInput = form.querySelector('#contactSenderEmail') as HTMLInputElement | null;
    const messageInput = form.querySelector('#contactMessage') as HTMLTextAreaElement | null;
    const feedback = this.sectionElement.querySelector('#formStatusFeedback') as HTMLElement | null;

    const name = nameInput?.value.trim() || '';
    const contact = contactInput?.value.trim() || '';
    const message = messageInput?.value.trim() || '';

    const dict = i18n.getDictionary();
    const t = dict.contact;
    const lang = i18n.getLanguage();

    if (!name || !contact || !message) {
      if (feedback) {
        feedback.className = 'form-status-feedback error';
        const errorMsg = lang === 'es'
          ? 'Por favor completa todos los campos obligatorios antes de transmitir.'
          : 'Please fill out all required fields before transmitting.';
        feedback.textContent = errorMsg;
      }
      if (!name && nameInput) nameInput.focus();
      else if (!contact && contactInput) contactInput.focus();
      else if (!message && messageInput) messageInput.focus();
      return;
    }

    const serviceName = this.getServiceTitle(this.selectedServiceKey, t);

    // Format WhatsApp Payload localized
    let payload = '';
    if (lang === 'es') {
      payload = 
`*Nueva Transmisión de Proyecto vía ROGUE:*
• *Operador / Nombre:* ${name}
• *Contacto / Canal:* ${contact}
• *Arquitectura Objetivo:* ${serviceName}
• *Brief del Proyecto:*
${message}`;
    } else if (lang === 'fr') {
      payload = 
`*Nouvelle Transmission de Projet via ROGUE:*
• *Opérateur / Nom:* ${name}
• *Contact / Canal:* ${contact}
• *Architecture Ciblée:* ${serviceName}
• *Brief de Mission:*
${message}`;
    } else if (lang === 'pt') {
      payload = 
`*Nova Transmissão de Projeto via ROGUE:*
• *Operador / Nome:* ${name}
• *Contato / Canal:* ${contact}
• *Arquitetura Alvo:* ${serviceName}
• *Briefing do Projeto:*
${message}`;
    } else {
      payload = 
`*New Project Transmission via ROGUE:*
• *Operator / Name:* ${name}
• *Contact / Channel:* ${contact}
• *Target Architecture:* ${serviceName}
• *Mission Brief:*
${message}`;
    }

    const waUrl = `https://wa.me/${this.WHATSAPP_PHONE}?text=${encodeURIComponent(payload)}`;

    // Show interactive success card with direct, unblockable fallback action
    if (feedback) {
      feedback.className = 'form-status-feedback success';
      feedback.innerHTML = `
        <div class="feedback-card-inner">
          <div class="feedback-badge-row">
            <span class="feedback-status-check">✓</span>
            <span class="feedback-status-text">${t.toastSent}</span>
          </div>
          <div class="feedback-action-row">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-toast-wa" id="btnToastWaOpen">
              <svg class="toast-wa-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17.47 14.39C17.19 14.25 15.84 13.59 15.59 13.49C15.34 13.4 15.15 13.35 14.97 13.63C14.78 13.91 14.25 14.53 14.09 14.72C13.93 14.91 13.77 14.93 13.5 14.79C13.22 14.65 12.32 14.36 11.26 13.41C10.43 12.67 9.87 11.76 9.71 11.48C9.55 11.2 9.69 11.05 9.83 10.91C9.96 10.78 10.11 10.59 10.24 10.42C10.38 10.26 10.43 10.14 10.52 9.96C10.61 9.77 10.57 9.61 10.5 9.47C10.43 9.33 9.88 7.97 9.65 7.41C9.42 6.87 9.19 6.94 9.03 6.93C8.87 6.92 8.68 6.92 8.49 6.92C8.3 6.92 8 6.99 7.74 7.27C7.49 7.55 6.76 8.23 6.76 9.6C6.76 10.98 7.76 12.31 7.9 12.5C8.04 12.69 9.88 15.52 12.69 16.73C15.5 17.94 15.5 17.54 16.01 17.49C16.52 17.44 17.64 16.82 17.87 16.18C18.1 15.53 18.1 14.98 18.03 14.87C17.96 14.75 17.75 14.53 17.47 14.39Z" fill="#ffffff"/>
              </svg>
              <span>${t.toastOpenWa}</span>
            </a>
            <span class="feedback-sub-hint">${t.toastFallbackHint}</span>
          </div>
        </div>
      `;
      try {
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch {}
    }

    // Launch WhatsApp reliably across all platforms:
    // 1. Programmatic anchor click with target="_blank" and rel="noopener noreferrer"
    let opened = false;
    try {
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.position = 'fixed';
      link.style.left = '-9999px';
      link.style.top = '-9999px';
      link.style.opacity = '0';
      link.setAttribute('aria-hidden', 'true');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try { link.remove(); } catch {}
      }, 300);
      opened = true;
    } catch (err) {
      console.warn('Programmatic anchor navigation error:', err);
    }

    // 2. Direct window.open fallback without 3rd parameter windowFeatures
    if (!opened) {
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        console.warn('window.open fallback error:', err);
      }
    }
  }

  private updateTranslations(dict: TranslationDictionary): void {
    const t = dict.contact;

    const tagBadge = this.sectionElement.querySelector('#contactTagBadge');
    const title = this.sectionElement.querySelector('#contactTitle');
    const subtitle = this.sectionElement.querySelector('#contactSubtitle');
    const waLabel = this.sectionElement.querySelector('#contactWaLabel');
    const waHeadline = this.sectionElement.querySelector('#contactWaHeadline');
    const waSubtext = this.sectionElement.querySelector('#contactWaSubtext');
    const waBtnText = this.sectionElement.querySelector('#contactWaBtnText');
    const emailLabel = this.sectionElement.querySelector('#contactEmailLabel');
    const emailSubtext = this.sectionElement.querySelector('#contactEmailSubtext');
    const emailBtnText = this.sectionElement.querySelector('#contactEmailBtnText');
    const formTitle = this.sectionElement.querySelector('#contactFormTitle');
    const formSubtitle = this.sectionElement.querySelector('#contactFormSubtitle');
    const selectedServiceTitle = this.sectionElement.querySelector('#contactSelectedServiceTitle');
    const nameLabel = this.sectionElement.querySelector('#contactNameLabel');
    const emailInputLabel = this.sectionElement.querySelector('#contactEmailInputLabel');
    const messageLabel = this.sectionElement.querySelector('#contactMessageLabel');
    const serviceCatLabel = this.sectionElement.querySelector('#contactServiceCatLabel');
    const submitBtnText = this.sectionElement.querySelector('#contactSubmitBtnText');
    const submitHint = this.sectionElement.querySelector('#contactSubmitHint');

    if (tagBadge) tagBadge.textContent = t.tag;
    if (title) title.textContent = t.title;
    if (subtitle) subtitle.textContent = t.subtitle;
    if (waLabel) waLabel.textContent = t.whatsAppLabel;
    if (waHeadline) waHeadline.textContent = t.whatsAppHeadline;
    if (waSubtext) waSubtext.textContent = t.whatsAppSubtext;
    if (waBtnText) waBtnText.textContent = t.whatsAppBtnText;
    if (emailLabel) emailLabel.textContent = t.emailLabel;
    if (emailSubtext) emailSubtext.textContent = t.emailSubtext;
    if (emailBtnText) emailBtnText.textContent = t.emailBtnText;
    if (formTitle) formTitle.textContent = t.formTitle;
    if (formSubtitle) formSubtitle.textContent = t.formSubtitle;
    if (selectedServiceTitle) selectedServiceTitle.textContent = t.selectedServiceTitle;
    if (nameLabel) nameLabel.innerHTML = `${t.nameLabel} <span class="required-mark">*</span>`;
    if (emailInputLabel) emailInputLabel.innerHTML = `${t.contactLabel} <span class="required-mark">*</span>`;
    if (messageLabel) messageLabel.innerHTML = `${t.messageLabel} <span class="required-mark">*</span>`;
    if (serviceCatLabel) serviceCatLabel.textContent = `${t.serviceCategoryLabel}:`;
    if (submitBtnText) submitBtnText.textContent = t.submitBtnText;
    if (submitHint) submitHint.textContent = t.submitHint;

    const feedbackMsg = this.sectionElement.querySelector('.feedback-status-text');
    if (feedbackMsg) feedbackMsg.textContent = t.toastSent;
    const toastBtnSpan = this.sectionElement.querySelector('#btnToastWaOpen span');
    if (toastBtnSpan) toastBtnSpan.textContent = t.toastOpenWa;
    const toastSubHint = this.sectionElement.querySelector('.feedback-sub-hint');
    if (toastSubHint) toastSubHint.textContent = t.toastFallbackHint;

    const nameInput = this.sectionElement.querySelector('#contactSenderName') as HTMLInputElement | null;
    const contactInput = this.sectionElement.querySelector('#contactSenderEmail') as HTMLInputElement | null;
    const msgInput = this.sectionElement.querySelector('#contactMessage') as HTMLTextAreaElement | null;

    if (nameInput) nameInput.placeholder = t.namePlaceholder;
    if (contactInput) contactInput.placeholder = t.contactPlaceholder;
    if (msgInput) msgInput.placeholder = t.messagePlaceholder;

    this.updateServiceSelectionDisplay();
  }

  /* --------------------------------------------------------------------------
     3D Starfield Continuous Cosmos Engine
     -------------------------------------------------------------------------- */
  private initStarfield(): void {
    this.canvas = this.sectionElement.querySelector('#contactStarfieldCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.handleResize();
    this.initStars();

    this.onResizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.onResizeHandler, { passive: true });

    this.onMouseMoveHandler = (e: MouseEvent) => {
      if (!this.isVisible) return;
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      this.mouseX = e.clientX - halfW;
      this.mouseY = e.clientY - halfH;
      this.targetCameraX = (this.mouseX / halfW) * 32;
      this.targetCameraY = (this.mouseY / halfH) * 22;
    };
    window.addEventListener('mousemove', this.onMouseMoveHandler, { passive: true });

    this.onScrollHandler = () => {
      if (!this.isVisible) return;
      const rect = this.sectionElement.getBoundingClientRect();
      const winH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (winH - rect.top) / (rect.height + winH)));
      this.scrollProgress = progress;
    };
    window.addEventListener('scroll', this.onScrollHandler, { passive: true });

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.canvas) {
            if (this.isVisible) {
              this.canvas.classList.add('visible');
            } else {
              this.canvas.classList.remove('visible');
            }
          }
        });
      },
      { root: null, rootMargin: '350px 0px 350px 0px', threshold: 0.01 }
    );

    this.intersectionObserver.observe(this.sectionElement);
  }

  private handleResize(): void {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const clientW = document.documentElement.clientWidth || window.innerWidth;
    const clientH = document.documentElement.clientHeight || window.innerHeight;
    this.canvasWidth = clientW;
    this.canvasHeight = clientH;

    this.canvas.width = Math.floor(clientW * dpr);
    this.canvas.height = Math.floor(clientH * dpr);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  private initStars(): void {
    this.stars = [];
    const spreadX = 2600;
    const spreadY = 2200;
    const maxZ = 2000;

    for (let i = 0; i < this.STAR_COUNT; i++) {
      const colorRoll = Math.random();
      let colorType: 'white' | 'cyan' | 'gold' = 'white';
      if (colorRoll < 0.28) colorType = 'cyan';
      else if (colorRoll < 0.42) colorType = 'gold';

      this.stars.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: Math.random() * maxZ + 20,
        radius: Math.random() * 1.5 + 0.45,
        baseAlpha: Math.random() * 0.65 + 0.35,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.035 + 0.012,
        colorType,
        hasSpikes: Math.random() < 0.16,
      });
    }
  }

  private startLoop(): void {
    const render = () => {
      this.cameraX += (this.targetCameraX - this.cameraX) * 0.05;
      this.cameraY += (this.targetCameraY - this.cameraY) * 0.05;

      if (this.isVisible) {
        this.renderStarfield();
      }

      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  private renderStarfield(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    const fov = 420;
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    const maxZ = 2000;
    const scrollOffsetY = (this.scrollProgress - 0.5) * 320;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.twinklePhase += star.twinkleSpeed;

      const relX = star.x - this.cameraX;
      const relY = star.y - this.cameraY + scrollOffsetY;
      const relZ = star.z;

      if (relZ <= 0) continue;

      const scale = fov / (fov + relZ);
      const px = centerX + relX * scale;
      const py = centerY + relY * scale;

      if (px < -20 || px > this.canvasWidth + 20 || py < -20 || py > this.canvasHeight + 20) {
        continue;
      }

      const depthFactor = 1 - star.z / maxZ;
      const twinkle = Math.sin(star.twinklePhase) * 0.25;
      const alpha = Math.min(1, Math.max(0.12, (star.baseAlpha + twinkle) * (depthFactor * 0.8 + 0.2)));
      const size = Math.max(0.65, star.radius * scale * 1.8);

      let starColor = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      let glowColor = `rgba(255, 255, 255, ${(alpha * 0.85).toFixed(3)})`;
      if (star.colorType === 'cyan') {
        starColor = `rgba(185, 235, 255, ${alpha.toFixed(3)})`;
        glowColor = `rgba(130, 220, 255, ${(alpha * 0.85).toFixed(3)})`;
      } else if (star.colorType === 'gold') {
        starColor = `rgba(255, 245, 210, ${alpha.toFixed(3)})`;
        glowColor = `rgba(255, 225, 150, ${(alpha * 0.85).toFixed(3)})`;
      }

      this.ctx.save();
      this.ctx.fillStyle = starColor;
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = size > 1.4 ? 8 : 3;

      this.ctx.beginPath();
      this.ctx.arc(px, py, size, 0, Math.PI * 2);
      this.ctx.fill();

      if (star.hasSpikes && size > 1.5 && alpha > 0.55) {
        this.ctx.strokeStyle = glowColor;
        this.ctx.lineWidth = 0.75;
        const spikeLen = size * 3.4;
        this.ctx.beginPath();
        this.ctx.moveTo(px - spikeLen, py);
        this.ctx.lineTo(px + spikeLen, py);
        this.ctx.moveTo(px, py - spikeLen);
        this.ctx.lineTo(px, py + spikeLen);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }
  }

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.onResizeHandler) {
      window.removeEventListener('resize', this.onResizeHandler);
    }
    if (this.onMouseMoveHandler) {
      window.removeEventListener('mousemove', this.onMouseMoveHandler);
    }
    if (this.onScrollHandler) {
      window.removeEventListener('scroll', this.onScrollHandler);
    }
    this.intersectionObserver?.disconnect();
  }
}
