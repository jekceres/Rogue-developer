import { i18n } from '../i18n/i18nManager';
import { TranslationDictionary } from '../types';

interface Star3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  hasSpikes: boolean;
  colorType: 'white' | 'gold' | 'cyan';
}

export class StorytellingSection {
  private sectionElement: HTMLElement;
  private imageCard: HTMLElement | null = null;
  private chaosContainer: HTMLElement | null = null;
  private servicesContainer: HTMLElement | null = null;
  private waCartBar: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  // Starfield particle state
  private stars: Star3D[] = [];
  private numStars: number = 360;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private fov: number = 400;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private targetCameraX: number = 0;
  private targetCameraY: number = 0;

  // Scroll state & animation loop
  private animFrameId: number | null = null;
  private isVisible: boolean = true;
  private currentProgress: number = 0;
  private targetProgress: number = 0;

  // Selected service state
  private selectedServiceKey: 'info' | 'ecom' | 'apps' | null = null;
  private readonly WHATSAPP_PHONE = '584242905469';

  // Event handlers
  private onScrollHandler: (() => void) | null = null;
  private onMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private onResizeHandler: (() => void) | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(sectionElement: HTMLElement) {
    this.sectionElement = sectionElement;
    this.init();
  }

  private init(): void {
    this.render();
    this.initElements();
    this.initStarfield();
    this.bindEvents();

    i18n.subscribe((_lang, dict) => {
      this.updateTranslations(dict);
    });

    // Initial pass
    this.updateScrollProgress();
    this.updateTranslations(i18n.getDictionary());

    try {
      const savedService = localStorage.getItem('rogue_selected_service') as 'info' | 'ecom' | 'apps' | null;
      if (savedService && ['info', 'ecom', 'apps'].includes(savedService)) {
        this.selectService(savedService, true);
      }
    } catch {}

    this.startLoop();
  }

  private render(): void {
    const dict = i18n.getDictionary();
    const story = dict.story;

    this.sectionElement.innerHTML = `
      <!-- Pinned Sticky 100vh Stage -->
      <div class="story-sticky-stage" id="storyStickyStage">
        <!-- Ambient Deep Space Vignette (Behind Image) -->
        <div class="story-ambient-vignette" aria-hidden="true"></div>

        <!-- Central Zooming 9:16 Portrait Image Container -->
        <div class="story-image-card" id="storyImageCard">
          <img 
            src="/img/creatures-in-planets-wallpaper-2.png" 
            alt="Universe of Digital Services - Creatures in Planets" 
            class="story-portrait-img protected-asset" 
            id="storyPortraitImg"
            draggable="false"
            loading="eager"
          />
          <div class="story-image-frame-overlay" id="storyImageOverlay"></div>
        </div>

        <!-- Background & Foreground 3D Starfield Canvas: Placed at z-index: 8 so stars float over the universe & around planets -->
        <canvas class="story-starfield-canvas" id="storyStarfieldCanvas" aria-hidden="true"></canvas>

        <!-- Asymmetric Editorial 'Organized Chaos' Informational Elements (Larger & with Space Motive Icons) -->
        <div class="story-chaos-layer" id="storyChaosLayer" aria-hidden="false">
          <!-- Item 1: Top-Left (Quick Commerce & WhatsApp Store) -->
          <div class="chaos-item chaos-item-1" style="--float-delay: 0s; --float-duration: 6.5s;">
            <div class="chaos-item-inner">
              <div class="chaos-card-header">
                <div class="chaos-space-icon-box" aria-hidden="true">
                  <!-- Orbital Satellite & Telemetry Waves Icon -->
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="rgba(255,255,255,0.3)" stroke-dasharray="3 2" transform="rotate(-20 16 16)" />
                    <rect x="13" y="13" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.2)" />
                    <line x1="8" y1="16" x2="13" y2="16" stroke-width="2.5" />
                    <rect x="5" y="13" width="3" height="6" rx="0.8" fill="rgba(255,255,255,0.3)" />
                    <line x1="19" y1="16" x2="24" y2="16" stroke-width="2.5" />
                    <rect x="24" y="13" width="3" height="6" rx="0.8" fill="rgba(255,255,255,0.3)" />
                    <path d="M16 19v4" />
                    <circle cx="16" cy="25" r="1.5" fill="currentColor" />
                    <path d="M12 27a6 6 0 0 0 8 0" stroke-width="1.4" />
                  </svg>
                </div>
                <div class="chaos-pill-tag">
                  <span class="chaos-dot"></span>
                  <span>QUICK COMMERCE</span>
                </div>
              </div>
              <p class="chaos-text" id="chaosNote1">${story.chaosNotes.note1}</p>
            </div>
          </div>

          <!-- Item 2: Bottom-Left (Inventory & Catalog) -->
          <div class="chaos-item chaos-item-2" style="--float-delay: 1.4s; --float-duration: 7.4s;">
            <div class="chaos-item-inner">
              <div class="chaos-card-header">
                <div class="chaos-space-icon-box" aria-hidden="true">
                  <!-- Ringed Planet & Orbital Cargo Matrix Icon -->
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="16" cy="16" r="7" fill="rgba(255,255,255,0.15)" />
                    <ellipse cx="16" cy="16" rx="14" ry="4.5" transform="rotate(-25 16 16)" />
                    <rect x="23" y="8" width="4.5" height="4.5" rx="1" fill="currentColor" />
                    <rect x="4.5" y="18" width="4.5" height="4.5" rx="1" fill="currentColor" />
                    <line x1="25" y1="12" x2="20" y2="14" stroke-dasharray="2 2" stroke="rgba(255,255,255,0.5)" />
                  </svg>
                </div>
                <div class="chaos-pill-tag">
                  <span class="chaos-dot"></span>
                  <span>INVENTORY & CATALOG</span>
                </div>
              </div>
              <p class="chaos-text" id="chaosNote2">${story.chaosNotes.note2}</p>
            </div>
          </div>

          <!-- Item 3: Top-Right (Showcase Services & Modern Web) -->
          <div class="chaos-item chaos-item-3" style="--float-delay: 0.8s; --float-duration: 6.8s;">
            <div class="chaos-item-inner">
              <div class="chaos-card-header">
                <div class="chaos-space-icon-box" aria-hidden="true">
                  <!-- Holographic Web Starship Viewport & Starlight Icon -->
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="5" width="24" height="19" rx="3.5" fill="rgba(255,255,255,0.15)" />
                    <line x1="4" y1="11" x2="28" y2="11" />
                    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="12" cy="8" r="1.2" fill="currentColor" />
                    <circle cx="16" cy="8" r="1.2" fill="currentColor" />
                    <path d="M16 13v8M12 17h8" stroke-width="2" />
                    <circle cx="16" cy="17" r="1.5" fill="currentColor" />
                    <circle cx="22" cy="20" r="1" fill="currentColor" />
                    <circle cx="9" cy="15" r="1" fill="currentColor" />
                  </svg>
                </div>
                <div class="chaos-pill-tag">
                  <span class="chaos-dot"></span>
                  <span>BRAND AUTHORITY</span>
                </div>
              </div>
              <p class="chaos-text" id="chaosNote3">${story.chaosNotes.note3}</p>
            </div>
          </div>

          <!-- Item 4: Bottom-Right (Cross-Platform Apps) -->
          <div class="chaos-item chaos-item-4" style="--float-delay: 2.1s; --float-duration: 7.9s;">
            <div class="chaos-item-inner">
              <div class="chaos-card-header">
                <div class="chaos-space-icon-box" aria-hidden="true">
                  <!-- Cosmic Rocket Launch / Space Propulsion Icon -->
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M25 7c-3.5 0-8 3-10 6l-3 1 2 4 4 2 1-3c3-2 6-6.5 6-10z" fill="rgba(255,255,255,0.18)" />
                    <circle cx="19" cy="11" r="1.8" fill="currentColor" />
                    <path d="M12 14l-4 2 2 3" />
                    <path d="M18 20l2 4 3-2" />
                    <path d="M11 21c-2 2-4 5-6 6 1-2 4-4 6-6z" fill="currentColor" />
                    <circle cx="8" cy="9" r="1.2" fill="currentColor" />
                    <circle cx="24" cy="23" r="1.2" fill="currentColor" />
                  </svg>
                </div>
                <div class="chaos-pill-tag">
                  <span class="chaos-dot"></span>
                  <span>CROSS-PLATFORM</span>
                </div>
              </div>
              <p class="chaos-text" id="chaosNote4">${story.chaosNotes.note4}</p>
            </div>
          </div>
        </div>

        <!-- Final Immersive Phase: Floating Services Showcase (Floating in Space like Hero) -->
        <div class="story-services-overlay" id="storyServicesOverlay">
          <div class="story-services-header">
            <span class="services-badge-tag" id="servicesHeaderTag">${story.servicesHeader.tag}</span>
            <h2 class="services-headline section-heading-3d" id="servicesHeaderTitle">${story.servicesHeader.title}</h2>
            <p class="services-subheadline" id="servicesHeaderSubtitle">${story.servicesHeader.subtitle}</p>
          </div>

          <div class="story-services-grid" id="storyServicesGrid">
            <!-- Service 1: Informational Website (Floating in Space 01) -->
            <div class="service-card" data-service="info" id="serviceCardInfo" tabindex="0" role="button">
              <div class="service-card-floating-layer">
                <div class="service-card-top">
                  <span class="service-card-num">01</span>
                  <div class="service-space-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                    </svg>
                    <span class="service-tag" id="service1Tag">${story.services.info.tag}</span>
                  </div>
                </div>
                <h3 class="service-title" id="service1Title">${story.services.info.title}</h3>
                <p class="service-desc" id="service1Desc">${story.services.info.description}</p>
                <div class="service-card-footer">
                  <button type="button" class="btn-service-select" id="service1Btn">
                    <span id="service1BtnText">${story.services.info.cta}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Service 2: E-commerce Website (Floating in Space 02) -->
            <div class="service-card" data-service="ecom" id="serviceCardEcom" tabindex="0" role="button">
              <div class="service-card-floating-layer">
                <div class="service-card-top">
                  <span class="service-card-num">02</span>
                  <div class="service-space-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-20 12 12)" />
                      <circle cx="12" cy="12" r="5" />
                    </svg>
                    <span class="service-tag" id="service2Tag">${story.services.ecom.tag}</span>
                  </div>
                </div>
                <h3 class="service-title" id="service2Title">${story.services.ecom.title}</h3>
                <p class="service-desc" id="service2Desc">${story.services.ecom.description}</p>
                <div class="service-card-footer">
                  <button type="button" class="btn-service-select" id="service2Btn">
                    <span id="service2BtnText">${story.services.ecom.cta}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Service 3: Apps for Android or Apple (Floating in Space 03) -->
            <div class="service-card" data-service="apps" id="serviceCardApps" tabindex="0" role="button">
              <div class="service-card-floating-layer">
                <div class="service-card-top">
                  <span class="service-card-num">03</span>
                  <div class="service-space-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    </svg>
                    <span class="service-tag" id="service3Tag">${story.services.apps.tag}</span>
                  </div>
                </div>
                <h3 class="service-title" id="service3Title">${story.services.apps.title}</h3>
                <p class="service-desc" id="service3Desc">${story.services.apps.description}</p>
                <div class="service-card-footer">
                  <button type="button" class="btn-service-select" id="service3Btn">
                    <span id="service3BtnText">${story.services.apps.cta}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating WhatsApp Transmission Action Bar -->
        <div class="story-wa-cart-bar" id="storyWaCartBar" aria-hidden="true">
          <div class="wa-cart-top-bar">
            <div class="wa-cart-info">
              <span class="wa-cart-pulse"></span>
              <span class="wa-cart-label" id="waCartLabel">${story.whatsappCart.title}</span>
              <strong class="wa-cart-choice" id="waCartChoice"></strong>
            </div>
            <button type="button" class="btn-wa-dismiss" id="waCartDismissBtn" aria-label="Dismiss selection">
              ✕
            </button>
          </div>
          <div class="wa-cart-actions">
            <a href="#" class="btn-wa-transmit" id="waCartTransmitBtn" target="_blank" rel="noopener noreferrer">
              <!-- WhatsApp Icon SVG with White Border and White Handset -->
              <svg class="wa-icon-svg" width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <!-- Outer speech bubble border in white -->
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Inner telephone handset in white -->
                <path d="M17.47 14.39C17.19 14.25 15.84 13.59 15.59 13.49C15.34 13.4 15.15 13.35 14.97 13.63C14.78 13.91 14.25 14.53 14.09 14.72C13.93 14.91 13.77 14.93 13.5 14.79C13.22 14.65 12.32 14.36 11.26 13.41C10.43 12.67 9.87 11.76 9.71 11.48C9.55 11.2 9.69 11.05 9.83 10.91C9.96 10.78 10.11 10.59 10.24 10.42C10.38 10.26 10.43 10.14 10.52 9.96C10.61 9.77 10.57 9.61 10.5 9.47C10.43 9.33 9.88 7.97 9.65 7.41C9.42 6.87 9.19 6.94 9.03 6.93C8.87 6.92 8.68 6.92 8.49 6.92C8.3 6.92 8 6.99 7.74 7.27C7.49 7.55 6.76 8.23 6.76 9.6C6.76 10.98 7.76 12.31 7.9 12.5C8.04 12.69 9.88 15.52 12.69 16.73C15.5 17.94 15.5 17.54 16.01 17.49C16.52 17.44 17.64 16.82 17.87 16.18C18.1 15.53 18.1 14.98 18.03 14.87C17.96 14.75 17.75 14.53 17.47 14.39Z" fill="#ffffff"/>
              </svg>
              <span id="waCartSendText">${story.whatsappCart.sendBtn}</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  private initElements(): void {
    this.imageCard = this.sectionElement.querySelector('#storyImageCard');
    this.chaosContainer = this.sectionElement.querySelector('#storyChaosLayer');
    this.servicesContainer = this.sectionElement.querySelector('#storyServicesOverlay');
    this.waCartBar = this.sectionElement.querySelector('#storyWaCartBar');
    this.canvas = this.sectionElement.querySelector('#storyStarfieldCanvas');

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d', { alpha: true });
    }
  }

  private initStarfield(): void {
    if (!this.canvas || !this.ctx) return;
    this.handleResize();

    this.stars = [];
    const spreadX = Math.max(1600, this.canvasWidth * 1.5);
    const spreadY = Math.max(1200, this.canvasHeight * 1.5);
    const maxZ = 1000;

    const colors: ('white' | 'gold' | 'cyan')[] = ['white', 'white', 'white', 'gold', 'cyan'];

    for (let i = 0; i < this.numStars; i++) {
      const z = Math.random() * maxZ + 1;
      this.stars.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: z,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.32,
        vz: (Math.random() - 0.5) * 0.38,
        radius: Math.random() * 1.8 + 0.6,
        baseAlpha: Math.random() * 0.6 + 0.35,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        hasSpikes: Math.random() < 0.1,
        colorType: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  private bindEvents(): void {
    // 1. Scroll tracking with immediate rendering
    this.onScrollHandler = () => {
      this.updateScrollProgress();
      this.renderScrollState(this.targetProgress);
    };
    window.addEventListener('scroll', this.onScrollHandler, { passive: true });

    // 2. Mouse Parallax inside Sticky Stage
    this.onMouseMoveHandler = (e: MouseEvent) => {
      const rect = this.sectionElement.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight && rect.bottom >= 0;
      if (!inView) return;

      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      this.mouseX = e.clientX - halfW;
      this.mouseY = e.clientY - halfH;

      this.targetCameraX = (this.mouseX / halfW) * 28;
      this.targetCameraY = (this.mouseY / halfH) * 20;
    };
    window.addEventListener('mousemove', this.onMouseMoveHandler, { passive: true });

    // 3. Resize handling
    this.onResizeHandler = () => {
      this.handleResize();
      this.updateScrollProgress();
    };
    window.addEventListener('resize', this.onResizeHandler);

    // 4. Intersection Observer to sleep RAF when completely off-screen
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
      });
    }, { rootMargin: '200px 0px' });
    this.intersectionObserver.observe(this.sectionElement);

    // 5. Service Card Interactivity
    const serviceCards = this.sectionElement.querySelectorAll('.service-card');
    serviceCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const key = target.getAttribute('data-service') as 'info' | 'ecom' | 'apps' | null;
        if (key) {
          this.selectService(key);
        }
      });

      card.addEventListener('keydown', (e) => {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          keyEvent.preventDefault();
          const target = e.currentTarget as HTMLElement;
          const key = target.getAttribute('data-service') as 'info' | 'ecom' | 'apps' | null;
          if (key) this.selectService(key);
        }
      });
    });

    // 6. Dismiss WhatsApp Cart selection
    const dismissBtn = this.sectionElement.querySelector('#waCartDismissBtn');
    dismissBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectService(null);
    });

    // 7. Synchronize if service changed from other sections (e.g. Contact form)
    window.addEventListener('rogue:service-selected', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.key !== this.selectedServiceKey) {
        this.selectService(detail.key, false);
      }
    });
  }

  private handleResize = (): void => {
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
  };

  private updateScrollProgress(): void {
    const rect = this.sectionElement.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = rect.height - windowH;

    if (totalDist <= 0) {
      this.targetProgress = 0;
      return;
    }

    // Progress 0.0 when top of section enters sticky position, 1.0 at the end
    const raw = -rect.top / totalDist;
    this.targetProgress = Math.max(0, Math.min(1, raw));
  }

  private selectService(key: 'info' | 'ecom' | 'apps' | null, broadcast: boolean = true): void {
    this.selectedServiceKey = key;
    try {
      if (key) {
        localStorage.setItem('rogue_selected_service', key);
      } else {
        localStorage.removeItem('rogue_selected_service');
      }
    } catch {}

    const cards = this.sectionElement.querySelectorAll('.service-card');
    cards.forEach((c) => c.classList.remove('active'));

    const dict = i18n.getDictionary();
    const story = dict.story;

    if (key) {
      const activeCard = this.sectionElement.querySelector(`[data-service="${key}"]`);
      activeCard?.classList.add('active');

      const serviceData = story.services[key];
      const waLink = `https://wa.me/${this.WHATSAPP_PHONE}?text=${encodeURIComponent(serviceData.waMessage)}`;

      const transmitBtn = this.sectionElement.querySelector('#waCartTransmitBtn') as HTMLAnchorElement | null;
      const choiceLabel = this.sectionElement.querySelector('#waCartChoice');

      if (transmitBtn) {
        transmitBtn.href = waLink;
      }
      if (choiceLabel) {
        choiceLabel.textContent = serviceData.title;
      }

      this.waCartBar?.classList.add('visible');

      if (broadcast) {
        window.dispatchEvent(new CustomEvent('rogue:service-selected', {
          detail: {
            key,
            title: serviceData.title,
            waMessage: serviceData.waMessage
          }
        }));
      }
    } else {
      this.waCartBar?.classList.remove('visible');
      if (broadcast) {
        window.dispatchEvent(new CustomEvent('rogue:service-selected', {
          detail: {
            key: null,
            title: null,
            waMessage: null
          }
        }));
      }
    }
  }

  private startLoop(): void {
    const tick = () => {
      // Lerp progress for ultra-silky fluid motion
      const pDiff = this.targetProgress - this.currentProgress;
      if (Math.abs(pDiff) > 0.0001) {
        this.currentProgress += pDiff * 0.2;
      } else {
        this.currentProgress = this.targetProgress;
      }

      // Smoothly update visual state on every frame
      this.renderScrollState(this.currentProgress);

      if (this.isVisible) {
        this.renderStarfield();
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  /**
   * Smoothly coordinates the 3-phase cinematic storytelling:
   * Phase 1 (0.00 -> 0.36): Small 9:16 portrait card grows vertically until its height touches the top & bottom of the screen (100vh).
   *                         Chaos notes fade & drift out gracefully.
   * Phase 2 (0.36 -> 0.68): Height is locked to 100vh. The container expands horizontally from 9:16 width out to 100vw,
   *                         revealing more of the panoramic wallpaper on the sides without zooming in on the image.
   * Phase 3 (0.68 -> 1.00): Fully immersive wallpaper (100vw x 100vh) + 3 floating services appear with zero-gravity levitation & WhatsApp cart.
   */
  private renderScrollState(progress: number): void {
    if (!this.imageCard) return;

    const vW = window.innerWidth;
    const vH = window.innerHeight;
    const isMobile = vW <= 820;

    // 1. Initial dimensions at scroll = 0 (9:16 portrait ratio)
    const initCardW = Math.min(300, vW * (isMobile ? 0.56 : 0.25));
    const initCardH = initCardW * (16 / 9);

    // Phase milestones
    const P_REACH_HEIGHT = 0.36;
    const P_REACH_WIDTH = 0.68;

    // Intermediate dimensions at P_REACH_HEIGHT (when height touches top & bottom of the web)
    const midCardH = vH;
    const portraitWAtFullH = vH * (9 / 16);
    const midCardW = Math.min(vW * (isMobile ? 0.82 : 0.92), portraitWAtFullH);

    let currentW: number;
    let currentH: number;
    let borderRadius: number;
    let borderAlpha: number;
    let shadowAlpha: number;
    let shadowSpread: number;

    if (progress <= P_REACH_HEIGHT) {
      // Phase 1: Card grows vertically and proportionally until height reaches top and bottom of viewport
      const p1 = Math.max(0, Math.min(1, progress / P_REACH_HEIGHT));
      const ease1 = this.easeInOutCubic(p1);

      currentW = initCardW + (midCardW - initCardW) * ease1;
      currentH = initCardH + (midCardH - initCardH) * ease1;
      borderRadius = Math.max(8, 18 * (1 - ease1 * 0.55));
      borderAlpha = Math.max(0.12, 0.20 * (1 - ease1 * 0.4));
      shadowAlpha = Math.max(0.60, 0.95 * (1 - ease1 * 0.3));
      shadowSpread = Math.max(30, 80 * (1 - ease1 * 0.4));
    } else if (progress <= P_REACH_WIDTH) {
      // Phase 2: Height is pinned to top & bottom (100vh). Container expands horizontally to reveal more of the image!
      const p2 = Math.max(0, Math.min(1, (progress - P_REACH_HEIGHT) / (P_REACH_WIDTH - P_REACH_HEIGHT)));
      const ease2 = this.easeInOutCubic(p2);

      currentH = vH; // LOCKED TO 100% of viewport height (top and bottom of web)
      currentW = midCardW + (vW - midCardW) * ease2; // Expands horizontally to 100vw
      borderRadius = Math.max(0, 8 * (1 - ease2));
      borderAlpha = Math.max(0, 0.12 * (1 - ease2));
      shadowAlpha = Math.max(0, 0.60 * (1 - ease2));
      shadowSpread = Math.max(0, 30 * (1 - ease2));
    } else {
      // Phase 3: Fully immersive 100vw x 100vh
      currentH = vH;
      currentW = vW;
      borderRadius = 0;
      borderAlpha = 0;
      shadowAlpha = 0;
      shadowSpread = 0;
    }

    // Apply calculated dimensions to container
    if (progress >= P_REACH_WIDTH) {
      this.imageCard.style.width = '100vw';
      this.imageCard.style.height = '100%';
      this.imageCard.style.borderRadius = '0px';
      this.imageCard.style.borderColor = 'transparent';
      this.imageCard.style.boxShadow = 'none';
      this.imageCard.style.transform = 'none';
    } else {
      this.imageCard.style.width = `${currentW.toFixed(1)}px`;
      this.imageCard.style.height = `${currentH.toFixed(1)}px`;
      this.imageCard.style.borderRadius = `${borderRadius.toFixed(1)}px`;
      this.imageCard.style.borderColor = `rgba(255, 255, 255, ${borderAlpha.toFixed(3)})`;
      this.imageCard.style.boxShadow = `0 30px ${shadowSpread.toFixed(0)}px rgba(0, 0, 0, ${shadowAlpha.toFixed(3)}), 0 0 50px rgba(255, 255, 255, ${(borderAlpha * 0.25).toFixed(3)})`;
      this.imageCard.style.transform = 'none';
    }

    // 2. Organized Chaos Text Elements Animate-Out (Phase 1: 0.00 to 0.32)
    if (this.chaosContainer) {
      const chaosProgress = Math.max(0, Math.min(1, progress / 0.32));
      const chaosAlpha = Math.max(0, 1 - chaosProgress * 1.25);
      const chaosDrift = chaosProgress * 90;

      const item1 = this.chaosContainer.querySelector('.chaos-item-1') as HTMLElement | null;
      const item2 = this.chaosContainer.querySelector('.chaos-item-2') as HTMLElement | null;
      const item3 = this.chaosContainer.querySelector('.chaos-item-3') as HTMLElement | null;
      const item4 = this.chaosContainer.querySelector('.chaos-item-4') as HTMLElement | null;

      if (item1) {
        item1.style.opacity = chaosAlpha.toFixed(3);
        item1.style.transform = `translate(${-chaosDrift}px, ${-chaosDrift * 0.7}px) rotate(${-3.5 - chaosProgress * 5}deg)`;
      }
      if (item2) {
        item2.style.opacity = chaosAlpha.toFixed(3);
        item2.style.transform = `translate(${-chaosDrift}px, ${chaosDrift * 0.7}px) rotate(${2 + chaosProgress * 4}deg)`;
      }
      if (item3) {
        item3.style.opacity = chaosAlpha.toFixed(3);
        item3.style.transform = `translate(${chaosDrift}px, ${-chaosDrift * 0.7}px) rotate(${3.2 + chaosProgress * 4}deg)`;
      }
      if (item4) {
        item4.style.opacity = chaosAlpha.toFixed(3);
        item4.style.transform = `translate(${chaosDrift}px, ${chaosDrift * 0.7}px) rotate(${-2.5 - chaosProgress * 5}deg)`;
      }

      this.chaosContainer.style.pointerEvents = chaosAlpha < 0.1 ? 'none' : 'auto';
    }

    // 3. Final Immersive State & Floating Services Entrance (Phase 3: progress 0.68 -> 1.00)
    if (this.servicesContainer) {
      const servicesProgress = Math.max(0, Math.min(1, (progress - 0.68) / 0.28));
      const servicesAlpha = this.easeInOutCubic(servicesProgress);
      const maxShift = isMobile ? 18 : 45;
      const servicesTranslateY = (1 - servicesAlpha) * maxShift;

      this.servicesContainer.style.opacity = servicesAlpha.toFixed(3);
      this.servicesContainer.style.transform = `translateY(${servicesTranslateY.toFixed(1)}px)`;
      this.servicesContainer.style.pointerEvents = servicesAlpha > 0.4 ? 'auto' : 'none';
    }

    // 4. Subtle dark overlay on background when services are revealed to maximize readability
    const overlay = this.sectionElement.querySelector('#storyImageOverlay') as HTMLElement | null;
    if (overlay) {
      const dimFactor = Math.max(0, Math.min(0.55, (progress - 0.68) * 2.2));
      overlay.style.backgroundColor = `rgba(0, 0, 0, ${dimFactor.toFixed(3)})`;
    }

    // 5. Floating WhatsApp Cart Bar visibility linked to progress and section boundaries
    if (this.waCartBar && this.selectedServiceKey) {
      const rect = this.sectionElement.getBoundingClientRect();
      const isInsideServicesSection = rect.bottom > 80 && rect.top < window.innerHeight;
      if (progress >= 0.68 && isInsideServicesSection) {
        this.waCartBar.classList.add('visible');
      } else {
        this.waCartBar.classList.remove('visible');
      }
    }
  }

  private renderStarfield(): void {
    if (!this.ctx || !this.canvas) return;

    // Smooth camera lerp for parallax
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.05;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.05;

    // Clean canvas buffer
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight / 2;
    const spreadX = Math.max(1600, this.canvasWidth * 1.5);
    const spreadY = Math.max(1200, this.canvasHeight * 1.5);
    const maxZ = 1000;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Update position
      star.x += star.vx;
      star.y += star.vy;
      star.z += star.vz;
      star.twinklePhase += star.twinkleSpeed;

      // Wrap boundaries
      if (star.x < -spreadX / 2) star.x = spreadX / 2;
      if (star.x > spreadX / 2) star.x = -spreadX / 2;
      if (star.y < -spreadY / 2) star.y = spreadY / 2;
      if (star.y > spreadY / 2) star.y = -spreadY / 2;
      if (star.z <= 1) star.z = maxZ;
      if (star.z > maxZ) star.z = 1;

      // 3D Perspective Projection
      const scale = this.fov / (this.fov + star.z);
      const px = cx + (star.x - this.cameraX) * scale;
      const py = cy + (star.y - this.cameraY) * scale;

      // Boundary check
      if (px < -15 || px > this.canvasWidth + 15 || py < -15 || py > this.canvasHeight + 15) {
        continue;
      }

      // Dynamic opacity
      const depthFactor = 1 - star.z / maxZ;
      const twinkle = Math.sin(star.twinklePhase) * 0.25;
      const alpha = Math.min(1, Math.max(0.12, (star.baseAlpha + twinkle) * (depthFactor * 0.8 + 0.2)));
      const size = Math.max(0.65, star.radius * scale * 1.8);

      // Color selection
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

      // Sparkle diffraction spikes on bright close stars
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

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private updateTranslations(dict: TranslationDictionary): void {
    const story = dict.story;

    // 1. Chaos Notes
    const note1 = this.sectionElement.querySelector('#chaosNote1');
    const note2 = this.sectionElement.querySelector('#chaosNote2');
    const note3 = this.sectionElement.querySelector('#chaosNote3');
    const note4 = this.sectionElement.querySelector('#chaosNote4');

    if (note1) note1.textContent = story.chaosNotes.note1;
    if (note2) note2.textContent = story.chaosNotes.note2;
    if (note3) note3.textContent = story.chaosNotes.note3;
    if (note4) note4.textContent = story.chaosNotes.note4;

    // 2. Services Header
    const sHeaderTag = this.sectionElement.querySelector('#servicesHeaderTag');
    const sHeaderTitle = this.sectionElement.querySelector('#servicesHeaderTitle');
    const sHeaderSubtitle = this.sectionElement.querySelector('#servicesHeaderSubtitle');

    if (sHeaderTag) sHeaderTag.textContent = story.servicesHeader.tag;
    if (sHeaderTitle) sHeaderTitle.textContent = story.servicesHeader.title;
    if (sHeaderSubtitle) sHeaderSubtitle.textContent = story.servicesHeader.subtitle;

    // 3. Service Cards
    const s1Tag = this.sectionElement.querySelector('#service1Tag');
    const s1Title = this.sectionElement.querySelector('#service1Title');
    const s1Desc = this.sectionElement.querySelector('#service1Desc');
    const s1BtnText = this.sectionElement.querySelector('#service1BtnText');

    if (s1Tag) s1Tag.textContent = story.services.info.tag;
    if (s1Title) s1Title.textContent = story.services.info.title;
    if (s1Desc) s1Desc.textContent = story.services.info.description;
    if (s1BtnText) s1BtnText.textContent = story.services.info.cta;

    const s2Tag = this.sectionElement.querySelector('#service2Tag');
    const s2Title = this.sectionElement.querySelector('#service2Title');
    const s2Desc = this.sectionElement.querySelector('#service2Desc');
    const s2BtnText = this.sectionElement.querySelector('#service2BtnText');

    if (s2Tag) s2Tag.textContent = story.services.ecom.tag;
    if (s2Title) s2Title.textContent = story.services.ecom.title;
    if (s2Desc) s2Desc.textContent = story.services.ecom.description;
    if (s2BtnText) s2BtnText.textContent = story.services.ecom.cta;

    const s3Tag = this.sectionElement.querySelector('#service3Tag');
    const s3Title = this.sectionElement.querySelector('#service3Title');
    const s3Desc = this.sectionElement.querySelector('#service3Desc');
    const s3BtnText = this.sectionElement.querySelector('#service3BtnText');

    if (s3Tag) s3Tag.textContent = story.services.apps.tag;
    if (s3Title) s3Title.textContent = story.services.apps.title;
    if (s3Desc) s3Desc.textContent = story.services.apps.description;
    if (s3BtnText) s3BtnText.textContent = story.services.apps.cta;

    // 4. Cart texts
    const waCartLabel = this.sectionElement.querySelector('#waCartLabel');
    const waCartSendText = this.sectionElement.querySelector('#waCartSendText');
    const waCartSendTextMobile = this.sectionElement.querySelector('#waCartSendTextMobile');

    if (waCartLabel) waCartLabel.textContent = story.whatsappCart.title;
    if (waCartSendText) waCartSendText.textContent = story.whatsappCart.sendBtn;
    if (waCartSendTextMobile) waCartSendTextMobile.textContent = story.whatsappCart.sendBtnMobile || 'Send';

    // Refresh active WhatsApp link if already chosen
    if (this.selectedServiceKey) {
      this.selectService(this.selectedServiceKey);
    }
  }

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.onScrollHandler) {
      window.removeEventListener('scroll', this.onScrollHandler);
    }
    if (this.onMouseMoveHandler) {
      window.removeEventListener('mousemove', this.onMouseMoveHandler);
    }
    if (this.onResizeHandler) {
      window.removeEventListener('resize', this.onResizeHandler);
    }

    this.intersectionObserver?.disconnect();
  }
}
