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

interface PortfolioSpecimenConfig {
  key: 'partinha' | 'ohiru' | 'alfombras' | 'northstar' | 'oceanside' | 'hemz' | 'sonrie' | 'nuestroquiro';
  index: string;
  url: string;
  image: string;
  colSpan: string;
  tiltDeg: number;
  offsetY?: string;
}

export class PortfolioUniverseSection {
  private container: HTMLElement;
  private modal: HTMLElement | null = null;
  private modalBackdrop: HTMLElement | null = null;
  private isModalOpen: boolean = false;
  private activeSpecimenKey: string | null = null;
  private observer: IntersectionObserver | null = null;

  // 3D Starfield continuous cosmos engine
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stars: Star3D[] = [];
  private numStars: number = 340;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private fov: number = 420;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private targetCameraX: number = 0;
  private targetCameraY: number = 0;
  private animFrameId: number | null = null;
  private isVisible: boolean = false;

  private onMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private onScrollHandler: (() => void) | null = null;
  private onResizeHandler: (() => void) | null = null;
  private sectionObserver: IntersectionObserver | null = null;

  private specimens: PortfolioSpecimenConfig[] = [
    {
      key: 'partinha',
      index: '01',
      url: 'https://partihna.vercel.app/',
      image: '/img/portfolio-partinha.png',
      colSpan: 'col-span-7',
      tiltDeg: -0.7,
    },
    {
      key: 'ohiru',
      index: '02',
      url: 'https://ohiru-alpha.vercel.app/',
      image: '/img/portfolio-ohiru.png',
      colSpan: 'col-span-5',
      tiltDeg: 1.1,
      offsetY: '1.4rem',
    },
    {
      key: 'alfombras',
      index: '03',
      url: 'https://la-tienda-de-las-alfombras.vercel.app/',
      image: '/img/portfolio-alfombras.png',
      colSpan: 'col-span-5',
      tiltDeg: -0.5,
    },
    {
      key: 'sonrie',
      index: '04',
      url: 'https://sonrie-dise-o.vercel.app',
      image: '/img/portfolio-sonrie.png',
      colSpan: 'col-span-7',
      tiltDeg: 0.8,
      offsetY: '1rem',
    },
    {
      key: 'oceanside',
      index: '05',
      url: 'https://oceansideelsalvador.com',
      image: '/img/portfolio-oceanside.png',
      colSpan: 'col-span-8',
      tiltDeg: -0.6,
    },
    {
      key: 'hemz',
      index: '06',
      url: 'https://inversiones-hemz.vercel.app/',
      image: '/img/portfolio-hemz.png',
      colSpan: 'col-span-4',
      tiltDeg: 1.2,
      offsetY: '1.4rem',
    },
    {
      key: 'northstar',
      index: '07',
      url: 'https://test-lake-xi-16.vercel.app',
      image: '/img/portfolio-northstar.png',
      colSpan: 'col-span-6',
      tiltDeg: -0.7,
    },
    {
      key: 'nuestroquiro',
      index: '08',
      url: 'https://www.nuestroquiro.com',
      image: '/img/portfolio-nuestroquiro.png',
      colSpan: 'col-span-6',
      tiltDeg: 0.7,
      offsetY: '1rem',
    },
  ];

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
    this.setupModal();
    this.setupCardInteractions();
    this.setupScrollReveals();
    this.initStarfield();

    // Subscribe to multi-language changes
    i18n.subscribe((_lang, dict) => {
      this.updateTranslations(dict);
    });
  }

  private render(): void {
    const dict = i18n.getDictionary();
    const p = dict.portfolio;

    this.container.innerHTML = `
      <div class="portfolio-universe-inner">
        <!-- 3D Starfield Canvas (Continuous Space Cosmos) -->
        <canvas class="portfolio-starfield-canvas" id="portfolioStarfieldCanvas" aria-hidden="true"></canvas>

        <!-- Cosmic Ambient Background Layers -->
        <div class="portfolio-ambient-grid" aria-hidden="true"></div>
        <div class="portfolio-ambient-glow portfolio-glow-1" aria-hidden="true"></div>
        <div class="portfolio-ambient-glow portfolio-glow-2" aria-hidden="true"></div>

        <!-- Oversized Floating Field Journal Watermarks -->
        <div class="floating-field-watermarks" aria-hidden="true">
          <span class="watermark-word watermark-1">EXPEDITION // ARCHIVE</span>
          <span class="watermark-word watermark-2">SPECIMEN // 01—08</span>
          <span class="watermark-word watermark-3">COSMIC // INTERFACES</span>
          <span class="watermark-word watermark-4">CHRONO: 2026.10</span>
        </div>

        <!-- Section Header -->
        <header class="portfolio-header">
          <div class="portfolio-tag-badge">
            <span class="tag-pulse-dot" aria-hidden="true"></span>
            <span id="portfolioHeaderTag">${p.headerTag}</span>
          </div>

          <h2 class="portfolio-title section-heading-3d" id="portfolioTitle">
            ${p.title}
          </h2>

          <p class="portfolio-subtitle" id="portfolioSubtitle">
            ${p.subtitle}
          </p>

          <div class="portfolio-meta-telemetry" aria-hidden="true">
            <span class="meta-item"><span class="meta-dot"></span> ARCHIVE STATUS: ACTIVE</span>
            <span class="meta-sep">/</span>
            <span class="meta-item">SECTORS EXPLORED: 08</span>
            <span class="meta-sep">/</span>
            <span class="meta-item">PARALLAX: ENGAGED</span>
          </div>
        </header>

        <!-- Asymmetric Editorial Grid (8 Creature/World Cards) -->
        <div class="portfolio-editorial-grid" id="portfolioGrid">
          ${this.specimens.map((specimen) => this.renderCardHtml(specimen, p)).join('')}
        </div>

        <!-- Strong Centered End-of-Section CTA -->
        <div class="portfolio-cta-block">
          <div class="portfolio-cta-backdrop-glow" aria-hidden="true"></div>
          <span class="portfolio-cta-kicker" id="portfolioCtaSubtitle">${p.ctaSubtitle}</span>
          <h3 class="portfolio-cta-heading" id="portfolioCtaHeadline">${p.ctaHeadline}</h3>
          
          <a 
            href="#contactSection" 
            class="btn-portfolio-touch" 
            id="portfolioCtaBtn"
            aria-label="Get in touch"
          >
            <span class="btn-touch-text" id="portfolioCtaBtnText">${p.ctaButton}</span>
            <span class="btn-touch-glow" aria-hidden="true"></span>
          </a>
        </div>
      </div>

      <!-- Cinematic Modal for Expanded Specimen Inspection (Accessible Overlay) -->
      <div class="portfolio-modal-backdrop" id="portfolioModalBackdrop" aria-hidden="true">
        <div class="portfolio-specimen-modal" id="portfolioSpecimenModal" role="dialog" aria-modal="true" aria-labelledby="modalSpecimenTitle">
          <div class="modal-dialog-content" id="modalDialogContent">
            <!-- Populated dynamically upon clicking a card -->
          </div>
        </div>
      </div>
    `;

    this.modalBackdrop = this.container.querySelector('#portfolioModalBackdrop');
    this.modal = this.container.querySelector('#portfolioSpecimenModal');
  }

  private renderCardHtml(specimen: PortfolioSpecimenConfig, p: TranslationDictionary['portfolio']): string {
    const itemData = p.items[specimen.key];
    const offsetStyle = specimen.offsetY ? `margin-top: ${specimen.offsetY};` : '';

    return `
      <article 
        class="specimen-card ${specimen.colSpan}" 
        data-key="${specimen.key}" 
        style="--card-rot: ${specimen.tiltDeg}deg; ${offsetStyle}"
        tabindex="0"
        role="button"
        aria-haspopup="dialog"
        aria-label="Inspect ${itemData.name}"
      >
        <!-- Holographic 3D Specular Sheen Layer -->
        <div class="card-specular-glare" aria-hidden="true"></div>

        <div class="specimen-card-inner">
          <!-- Scientific Card Top Telemetry -->
          <div class="card-telemetry-bar">
            <span class="specimen-number">№ ${specimen.index}</span>
            <span class="specimen-category" id="cat_${specimen.key}">${itemData.category}</span>
            <span class="specimen-coords" title="Coordinates">${itemData.coordinates}</span>
          </div>

          <!-- Visual Frame with Zoom & Hover Overlay -->
          <div class="specimen-media-frame">
            <img 
              src="${specimen.image}" 
              alt="${itemData.name} - Specimen ${specimen.index}" 
              class="specimen-img protected-asset" 
              loading="lazy"
              draggable="false"
            />
            <div class="specimen-media-overlay" aria-hidden="true"></div>
            
            <div class="specimen-inspect-badge">
              <span>EXPLORE SPECIMEN</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </div>
          </div>

          <!-- Card Typographic Content -->
          <div class="specimen-body">
            <div class="specimen-sector-tag" id="sector_${specimen.key}">${itemData.sector}</div>
            <h3 class="specimen-name" id="name_${specimen.key}">${itemData.name}</h3>
            <p class="specimen-desc" id="desc_${specimen.key}">${itemData.shortDesc}</p>
            
            <div class="specimen-footer-actions">
              <span class="action-expand-hint">
                <span class="hint-dot"></span>
                <span>Click to expand details</span>
              </span>
              <a 
                href="${specimen.url}" 
                class="direct-site-pill" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Open ${itemData.name} in new tab"
                onclick="event.stopPropagation();"
              >
                <span>Live ↗</span>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  private setupCardInteractions(): void {
    const cards = this.container.querySelectorAll<HTMLElement>('.specimen-card');
    cards.forEach((card) => {
      // Click expansion
      card.addEventListener('click', () => {
        const key = card.getAttribute('data-key');
        if (key) {
          this.openSpecimenModal(key);
        }
      });

      // Keyboard accessibility (Enter or Space)
      card.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const key = card.getAttribute('data-key');
          if (key) {
            this.openSpecimenModal(key);
          }
        }
      });

      // Interactive 3D Cursor Movement
      card.addEventListener('mouseenter', () => {
        card.classList.add('is-tilting');
        card.style.setProperty('--glare-opacity', '1');
      });

      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        // 3D Tilt calculation:
        // Cursor at top tilts card up toward user (positive rotateX)
        // Cursor at bottom tilts card down away from user (negative rotateX)
        // Cursor at right tilts right edge toward user (positive rotateY)
        // Cursor at left tilts left edge toward user (negative rotateY)
        const tiltX = (0.5 - normY) * 22; // up to ±11 deg
        const tiltY = (normX - 0.5) * 26; // up to ±13 deg

        card.style.setProperty('--mouse-tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--mouse-tilt-y', `${tiltY.toFixed(2)}deg`);
        card.style.setProperty('--glare-x', `${(normX * 100).toFixed(1)}%`);
        card.style.setProperty('--glare-y', `${(normY * 100).toFixed(1)}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--mouse-tilt-x', '0deg');
        card.style.setProperty('--mouse-tilt-y', '0deg');
        card.style.setProperty('--glare-opacity', '0');
      });
    });

    // Smooth scroll navigation to Contact Section
    const ctaBtn = this.container.querySelector('#portfolioCtaBtn');
    ctaBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('contactSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  private setupModal(): void {
    if (!this.modalBackdrop) return;

    // Light dismiss on backdrop click (clicking outside the modal card)
    this.modalBackdrop.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.modalBackdrop) {
        this.closeModal();
      }
    });

    // Handle Esc key to close modal
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.closeModal();
      }
    });
  }

  private openSpecimenModal(key: string): void {
    if (!this.modal) return;
    const specimen = this.specimens.find((s) => s.key === key);
    if (!specimen) return;

    this.activeSpecimenKey = key;
    const dict = i18n.getDictionary();
    const p = dict.portfolio;
    const itemData = p.items[specimen.key];

    const contentEl = this.modal.querySelector('#modalDialogContent');
    if (!contentEl) return;

    contentEl.innerHTML = `
      <div class="modal-specimen-layout">
        <!-- Close Button -->
        <button type="button" class="btn-modal-close" id="btnModalClose" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Preview Image Gallery Frame -->
        <div class="modal-specimen-preview">
          <img 
            src="${specimen.image}" 
            alt="${itemData.name} Preview" 
            class="modal-preview-img protected-asset"
            draggable="false"
          />
          <div class="modal-preview-glow" aria-hidden="true"></div>
        </div>

        <!-- Archival Specimen Data Panel -->
        <div class="modal-specimen-data">
          <div class="modal-data-header">
            <div class="modal-tag-row">
              <span class="modal-specimen-idx">SPECIMEN // ${specimen.index}</span>
              <span class="modal-category-badge">${itemData.category}</span>
            </div>
            <h3 class="modal-specimen-title" id="modalSpecimenTitle">${itemData.name}</h3>
            <span class="modal-sector-line">${itemData.sector}</span>
          </div>

          <div class="modal-desc-box">
            <p class="modal-full-desc">${itemData.fullDesc}</p>
          </div>

          <div class="modal-specs-table">
            <div class="modal-spec-row">
              <span class="spec-label">Coordinates:</span>
              <span class="spec-value">${itemData.coordinates}</span>
            </div>
            <div class="modal-spec-row">
              <span class="spec-label">Status:</span>
              <span class="spec-value text-emerald"><span class="live-pulse-dot"></span> LIVE & DEPLOYED</span>
            </div>
            <div class="modal-spec-row">
              <span class="spec-label">Architecture:</span>
              <span class="spec-value">Tailored Reactive Interface</span>
            </div>
          </div>

          <div class="modal-actions-row">
            <a 
              href="${specimen.url}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-modal-visit-site"
              id="btnModalVisitSite"
            >
              <span>${p.modalExplore}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>

            <button type="button" class="btn-modal-dismiss-sec" id="btnModalDismissSec">
              ${p.modalClose}
            </button>
          </div>
        </div>
      </div>
    `;

    // Hook modal buttons
    contentEl.querySelector('#btnModalClose')?.addEventListener('click', () => this.closeModal());
    contentEl.querySelector('#btnModalDismissSec')?.addEventListener('click', () => this.closeModal());

    // Show modal overlay
    this.isModalOpen = true;
    this.modalBackdrop?.classList.add('is-open');
    this.modalBackdrop?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  private closeModal(): void {
    this.isModalOpen = false;
    this.modalBackdrop?.classList.remove('is-open');
    this.modalBackdrop?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.activeSpecimenKey = null;
  }

  private setupScrollReveals(): void {
    const cards = this.container.querySelectorAll<HTMLElement>('.specimen-card');
    if (!('IntersectionObserver' in window)) {
      cards.forEach((c) => c.classList.add('revealed'));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '60px 0px 0px 0px',
        threshold: 0.02,
      }
    );

    cards.forEach((card, index) => {
      card.style.setProperty('--reveal-delay', `${index * 85}ms`);
      this.observer?.observe(card);
    });
  }

  public updateTranslations(dict: TranslationDictionary): void {
    const p = dict.portfolio;

    const tagEl = this.container.querySelector('#portfolioHeaderTag');
    if (tagEl) tagEl.textContent = p.headerTag;

    const titleEl = this.container.querySelector('#portfolioTitle');
    if (titleEl) titleEl.textContent = p.title;

    const subEl = this.container.querySelector('#portfolioSubtitle');
    if (subEl) subEl.textContent = p.subtitle;

    const ctaHeadEl = this.container.querySelector('#portfolioCtaHeadline');
    if (ctaHeadEl) ctaHeadEl.textContent = p.ctaHeadline;

    const ctaSubEl = this.container.querySelector('#portfolioCtaSubtitle');
    if (ctaSubEl) ctaSubEl.textContent = p.ctaSubtitle;

    const ctaBtnText = this.container.querySelector('#portfolioCtaBtnText');
    if (ctaBtnText) ctaBtnText.textContent = p.ctaButton;

    // Update each card's localized text
    this.specimens.forEach((specimen) => {
      const itemData = p.items[specimen.key];
      const catEl = this.container.querySelector(`#cat_${specimen.key}`);
      if (catEl) catEl.textContent = itemData.category;

      const sectorEl = this.container.querySelector(`#sector_${specimen.key}`);
      if (sectorEl) sectorEl.textContent = itemData.sector;

      const nameEl = this.container.querySelector(`#name_${specimen.key}`);
      if (nameEl) nameEl.textContent = itemData.name;

      const descEl = this.container.querySelector(`#desc_${specimen.key}`);
      if (descEl) descEl.textContent = itemData.shortDesc;
    });

    // If modal is open, re-render it with new language
    if (this.isModalOpen && this.activeSpecimenKey) {
      this.openSpecimenModal(this.activeSpecimenKey);
    }
  }

  /* --------------------------------------------------------------------------
     3D Starfield Continuous Cosmos Engine
     -------------------------------------------------------------------------- */
  private initStarfield(): void {
    this.canvas = this.container.querySelector('#portfolioStarfieldCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.handleResize();
    this.initStars();

    // Mouse parallax
    this.onMouseMoveHandler = (e: MouseEvent) => {
      if (!this.isVisible) return;
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      this.mouseX = e.clientX - halfW;
      this.mouseY = e.clientY - halfH;
      this.targetCameraX = (this.mouseX / halfW) * 26;
      this.targetCameraY = (this.mouseY / halfH) * 18;
    };
    window.addEventListener('mousemove', this.onMouseMoveHandler, { passive: true });

    // Scroll parallax
    this.onScrollHandler = () => {
      // Dynamic parallax offset updated in render loop
    };
    window.addEventListener('scroll', this.onScrollHandler, { passive: true });

    // Window resize
    this.onResizeHandler = () => {
      this.handleResize();
    };
    window.addEventListener('resize', this.onResizeHandler);

    // Section visibility observer
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible) {
            this.canvas?.classList.add('visible');
            if (!this.animFrameId) {
              this.startStarLoop();
            }
          } else {
            this.canvas?.classList.remove('visible');
            if (this.animFrameId) {
              cancelAnimationFrame(this.animFrameId);
              this.animFrameId = null;
            }
          }
        });
      },
      { rootMargin: '350px 0px 350px 0px' }
    );
    this.sectionObserver.observe(this.container);
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

  private initStars(): void {
    this.stars = [];
    const spreadX = Math.max(1600, window.innerWidth * 1.5);
    const spreadY = Math.max(1200, window.innerHeight * 1.5);
    const maxZ = 1000;

    for (let i = 0; i < this.numStars; i++) {
      const colorRoll = Math.random();
      let colorType: 'white' | 'gold' | 'cyan' = 'white';
      if (colorRoll > 0.82) {
        colorType = 'cyan';
      } else if (colorRoll > 0.68) {
        colorType = 'gold';
      }

      this.stars.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: Math.random() * maxZ,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        vz: -0.22 - Math.random() * 0.35,
        radius: 0.6 + Math.random() * 1.3,
        baseAlpha: 0.3 + Math.random() * 0.65,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        hasSpikes: Math.random() > 0.78,
        colorType,
      });
    }
  }

  private startStarLoop(): void {
    const tick = () => {
      if (this.isVisible) {
        this.renderStarfield();
        this.animFrameId = requestAnimationFrame(tick);
      } else {
        this.animFrameId = null;
      }
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private renderStarfield(): void {
    if (!this.ctx || !this.canvas) return;

    // Smooth camera lerp for mouse parallax
    this.cameraX += (this.targetCameraX - this.cameraX) * 0.05;
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.05;

    // Parallax scroll calculation relative to Section 3
    const rect = this.container.getBoundingClientRect();
    const totalDist = rect.height - window.innerHeight;
    const scrollFactor = totalDist > 0 ? Math.max(0, Math.min(1, -rect.top / totalDist)) : 0;
    const scrollOffsetY = (scrollFactor - 0.5) * 250;

    // Clear canvas
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

      star.x += star.vx;
      star.y += star.vy;
      star.z += star.vz;
      star.twinklePhase += star.twinkleSpeed;

      if (star.x < -spreadX / 2) star.x = spreadX / 2;
      if (star.x > spreadX / 2) star.x = -spreadX / 2;
      if (star.y < -spreadY / 2) star.y = spreadY / 2;
      if (star.y > spreadY / 2) star.y = -spreadY / 2;
      if (star.z <= 1) star.z = maxZ;
      if (star.z > maxZ) star.z = 1;

      // 3D perspective projection
      const scale = this.fov / (this.fov + star.z);
      const px = cx + (star.x - this.cameraX) * scale;
      const py = cy + (star.y - (this.cameraY + scrollOffsetY)) * scale;

      if (px < -15 || px > this.canvasWidth + 15 || py < -15 || py > this.canvasHeight + 15) {
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

      // Sparkle diffraction spikes on bright stars
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
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.onMouseMoveHandler) {
      window.removeEventListener('mousemove', this.onMouseMoveHandler);
    }
    if (this.onScrollHandler) {
      window.removeEventListener('scroll', this.onScrollHandler);
    }
    if (this.onResizeHandler) {
      window.removeEventListener('resize', this.onResizeHandler);
    }
    this.sectionObserver?.disconnect();
    this.observer?.disconnect();
    this.closeModal();
    this.modal = null;
    this.modalBackdrop = null;
  }
}
