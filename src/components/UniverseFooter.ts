import { i18n } from '../i18n/i18nManager';
import { TranslationDictionary } from '../types';

interface FooterStar {
  x: number;
  y: number;
  z: number;
  radius: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  colorType: 'white' | 'cyan' | 'gold';
}

export class UniverseFooter {
  private footerElement: HTMLElement;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stars: FooterStar[] = [];
  private readonly STAR_COUNT = 160;
  private animFrameId: number | null = null;
  private isVisible: boolean = false;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private targetCameraX: number = 0;
  private targetCameraY: number = 0;
  private onResizeHandler: (() => void) | null = null;
  private onMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(footerElement: HTMLElement) {
    this.footerElement = footerElement;
    this.init();
  }

  private init(): void {
    this.render();
    this.initStarfield();
    this.bindEvents();

    i18n.subscribe((_lang, dict) => {
      this.updateTranslations(dict);
    });

    this.updateTranslations(i18n.getDictionary());
  }

  private render(): void {
    const dict = i18n.getDictionary();
    const f = dict.footer;

    this.footerElement.innerHTML = `
      <!-- 3D Starfield Canvas for Continuous Universe Cosmos -->
      <canvas class="footer-starfield-canvas" id="footerStarfieldCanvas" aria-hidden="true"></canvas>

      <!-- Celestial Event Horizon & Transition Glow from Contact Section -->
      <div class="footer-event-horizon" aria-hidden="true">
        <div class="horizon-arc-line"></div>
        <div class="horizon-stellar-glow"></div>
      </div>

      <div class="universe-footer-inner">
        <!-- 3-Pillar Architectural Matrix (Directory, Direct Beacons, Telemetry) -->
        <div class="footer-matrix-grid">
          <!-- Pillar 1: Explore Horizons (Directory) -->
          <div class="matrix-pillar pillar-directory">
            <span class="pillar-kicker" id="footerNavTitle">${f.navDirectoryTitle}</span>
            <ul class="matrix-nav-list">
              <li><a href="#storytellingSection" class="matrix-nav-link" id="footerNavServices">${f.navServices}</a></li>
              <li><a href="#portfolioUniverseSection" class="matrix-nav-link" id="footerNavPortfolio">${f.navPortfolio}</a></li>
              <li><a href="#whoIAmSection" class="matrix-nav-link" id="footerNavAboutMe">${f.navAboutMe}</a></li>
              <li><a href="#contactSection" class="matrix-nav-link" id="footerNavContact">${f.navContact}</a></li>
            </ul>
          </div>

          <!-- Pillar 2: Active Beacons (Direct WhatsApp & Email Uplink) -->
          <div class="matrix-pillar pillar-beacons">
            <span class="pillar-kicker" id="footerBeaconsTitle">${f.beaconsTitle}</span>
            <div class="beacon-links-wrap">
              <a 
                href="https://wa.me/584242905469?text=${encodeURIComponent('Hello Jesús! I would like to get in touch with you regarding a project.')}" 
                class="matrix-beacon-link beacon-wa" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Direct WhatsApp Beacon"
              >
                <span class="beacon-pulse-dot wa-dot"></span>
                <span id="footerBeaconWa">${f.beaconWhatsApp}</span>
                <span class="beacon-arrow">↗</span>
              </a>

              <a 
                href="mailto:jekceres@gmail.com" 
                class="matrix-beacon-link beacon-mail" 
                aria-label="Direct Email Beacon"
              >
                <span class="beacon-pulse-dot mail-dot"></span>
                <span id="footerBeaconEmail">${f.beaconEmail}</span>
                <span class="beacon-arrow">↗</span>
              </a>
            </div>
          </div>

          <!-- Pillar 3: System Telemetry & Back to Top Floating Action -->
          <div class="matrix-pillar pillar-telemetry">
            <span class="pillar-kicker" id="footerTelemetryTitle">${f.telemetryTitle}</span>
            <div class="telemetry-readout-deck">
              <span class="readout-item" id="footerOriginCity">${f.originCity}</span>
              <span class="readout-item" id="footerStatusActive">${f.statusActive}</span>
            </div>

            <button type="button" class="btn-footer-apogee" id="btnFooterBackToTop" aria-label="Return to top of page">
              <span class="apogee-arrow">↑</span>
              <span id="footerBackToTopText">${f.backToTop}</span>
            </button>
          </div>
        </div>

        <!-- Colophon Motto Banner -->
        <div class="footer-colophon-banner">
          <span class="colophon-star">✦</span>
          <span class="colophon-text" id="footerColophonMotto">${f.colophonMotto}</span>
          <span class="colophon-star">✦</span>
        </div>

        <!-- Minimalist Copyright Line -->
        <div class="footer-meta-bottom">
          <p class="footer-copyright" id="footerCopyright">
            ${f.copyright}
          </p>
          <div class="footer-status-pill">
            <span class="status-pulse-dot"></span>
            <span>SYSTEM_ONLINE // V_8.4</span>
          </div>
        </div>
      </div>
    `;
  }

  private initStarfield(): void {
    this.canvas = this.footerElement.querySelector('#footerStarfieldCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.handleResize();
    this.initStars();

    this.onResizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.onResizeHandler, { passive: true });

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.footerElement);
    }

    this.onMouseMoveHandler = (e: MouseEvent) => {
      if (!this.isVisible) return;
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      this.mouseX = e.clientX - halfW;
      this.mouseY = e.clientY - halfH;
      this.targetCameraX = (this.mouseX / halfW) * 24;
      this.targetCameraY = (this.mouseY / halfH) * 16;
    };
    window.addEventListener('mousemove', this.onMouseMoveHandler, { passive: true });

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
        });
      },
      { root: null, rootMargin: '250px 0px 250px 0px', threshold: 0.01 }
    );
    this.intersectionObserver.observe(this.footerElement);

    this.startStarLoop();
  }

  private handleResize(): void {
    if (!this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.footerElement.getBoundingClientRect();
    this.canvasWidth = Math.floor(rect.width || document.documentElement.clientWidth || window.innerWidth);
    this.canvasHeight = Math.floor(rect.height || 450);

    this.canvas.width = Math.floor(this.canvasWidth * dpr);
    this.canvas.height = Math.floor(this.canvasHeight * dpr);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  private initStars(): void {
    this.stars = [];
    const spreadX = 2200;
    const spreadY = 1600;
    const maxZ = 1800;

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
      });
    }
  }

  private startStarLoop(): void {
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

    const fov = 400;
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 2;
    const maxZ = 1800;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.twinklePhase += star.twinkleSpeed;

      const relX = star.x - this.cameraX;
      const relY = star.y - this.cameraY;
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
        starColor = `rgba(255, 230, 185, ${alpha.toFixed(3)})`;
        glowColor = `rgba(255, 210, 130, ${(alpha * 0.85).toFixed(3)})`;
      }

      // Glow halo
      this.ctx.beginPath();
      this.ctx.arc(px, py, size * 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = glowColor;
      this.ctx.globalAlpha = alpha * 0.35;
      this.ctx.fill();

      // Sharp core
      this.ctx.beginPath();
      this.ctx.arc(px, py, size, 0, Math.PI * 2);
      this.ctx.fillStyle = starColor;
      this.ctx.globalAlpha = alpha;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
  }

  private bindEvents(): void {
    // Smooth scrolling for navigation links
    const links = this.footerElement.querySelectorAll('.matrix-nav-link');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Back to top button
    const backToTopBtn = this.footerElement.querySelector('#btnFooterBackToTop');
    backToTopBtn?.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  private updateTranslations(dict: TranslationDictionary): void {
    const f = dict.footer;

    const navTitle = this.footerElement.querySelector('#footerNavTitle');
    const navServices = this.footerElement.querySelector('#footerNavServices');
    const navPortfolio = this.footerElement.querySelector('#footerNavPortfolio');
    const navAboutMe = this.footerElement.querySelector('#footerNavAboutMe');
    const navContact = this.footerElement.querySelector('#footerNavContact');
    const beaconsTitle = this.footerElement.querySelector('#footerBeaconsTitle');
    const beaconWa = this.footerElement.querySelector('#footerBeaconWa');
    const beaconEmail = this.footerElement.querySelector('#footerBeaconEmail');
    const telemetryTitle = this.footerElement.querySelector('#footerTelemetryTitle');
    const originCity = this.footerElement.querySelector('#footerOriginCity');
    const statusActive = this.footerElement.querySelector('#footerStatusActive');
    const colophonMotto = this.footerElement.querySelector('#footerColophonMotto');
    const backToTopText = this.footerElement.querySelector('#footerBackToTopText');
    const copyright = this.footerElement.querySelector('#footerCopyright');

    if (navTitle) navTitle.textContent = f.navDirectoryTitle;
    if (navServices) navServices.textContent = f.navServices;
    if (navPortfolio) navPortfolio.textContent = f.navPortfolio;
    if (navAboutMe) navAboutMe.textContent = f.navAboutMe;
    if (navContact) navContact.textContent = f.navContact;
    if (beaconsTitle) beaconsTitle.textContent = f.beaconsTitle;
    if (beaconWa) beaconWa.textContent = f.beaconWhatsApp;
    if (beaconEmail) beaconEmail.textContent = f.beaconEmail;
    if (telemetryTitle) telemetryTitle.textContent = f.telemetryTitle;
    if (originCity) originCity.textContent = f.originCity;
    if (statusActive) statusActive.textContent = f.statusActive;
    if (colophonMotto) colophonMotto.textContent = f.colophonMotto;
    if (backToTopText) backToTopText.textContent = f.backToTop;
    if (copyright) copyright.textContent = f.copyright;
  }

  public destroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.onResizeHandler) window.removeEventListener('resize', this.onResizeHandler);
    if (this.onMouseMoveHandler) window.removeEventListener('mousemove', this.onMouseMoveHandler);
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
