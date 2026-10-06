import { Starfield } from './Starfield';
import { RevealSpotlight } from './RevealSpotlight';
import { Falling3DText } from './Falling3DText';
import { i18n } from '../i18n/i18nManager';
import { TranslationDictionary } from '../types';

export class HeroSection {
  private heroElement: HTMLElement;
  private starfield: Starfield | null = null;
  private revealSpotlight: RevealSpotlight | null = null;
  private fallingText: Falling3DText | null = null;

  constructor(heroElement: HTMLElement) {
    this.heroElement = heroElement;
    this.init();
  }

  private init(): void {
    this.render();

    // 1. Initialize Universe Background & Starfield
    const canvas = this.heroElement.querySelector('#starfieldCanvas') as HTMLCanvasElement | null;
    if (canvas) {
      this.starfield = new Starfield(canvas);
    }

    // 2. Initialize Reveal Spotlight Layer
    const revealLayer = this.heroElement.querySelector('#heroRevealLayer') as HTMLElement | null;
    if (revealLayer) {
      this.revealSpotlight = new RevealSpotlight(this.heroElement, revealLayer);
    }

    // 3. Initialize Falling 3D Text & Emergence of Universe Background
    const textContainer = this.heroElement.querySelector('#hero3DTextContainer') as HTMLElement | null;
    const universeBg = this.heroElement.querySelector('#heroUniverseBg') as HTMLElement | null;
    if (textContainer) {
      this.fallingText = new Falling3DText(textContainer, universeBg);
    }

    // 4. Bind i18n updates for other hero labels
    this.updateTranslations(i18n.getDictionary());
    i18n.subscribe((_lang, dict) => {
      this.updateTranslations(dict);
    });

    // 5. Smooth scroll navigation for Explore CTA and scroll indicator
    const ctaExplore = this.heroElement.querySelector('#heroCtaExplore') || this.heroElement.querySelector('#heroCtaContact');
    ctaExplore?.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('storytellingSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    const scrollIndicator = this.heroElement.querySelector('.hero-scroll-indicator');
    scrollIndicator?.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('storytellingSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  private render(): void {
    this.heroElement.innerHTML = `
      <!-- Base Background Layer: Universe image -->
      <div class="hero-universe-bg" id="heroUniverseBg" aria-hidden="true">
        <img 
          src="/img/universe.jpg" 
          alt="" 
          class="hero-base-img protected-asset" 
          draggable="false"
          loading="eager"
        />
        <div class="hero-universe-overlay"></div>
      </div>

      <!-- Reveal Spotlight Layer: Creatures in planets wallpaper -->
      <div class="hero-reveal-container" id="heroRevealLayer" aria-hidden="true">
        <img 
          src="/img/creatures in planets wallpaper.png" 
          alt="" 
          class="hero-reveal-img protected-asset" 
          draggable="false"
          loading="eager"
        />
      </div>

      <!-- 3D Starfield Canvas floating above universe and revealed creatures -->
      <canvas id="starfieldCanvas" class="starfield-canvas" aria-hidden="true"></canvas>

      <!-- Foreground UI: Centered 3D Falling Typography, Badges & CTAs -->
      <div class="hero-foreground-content">
        <!-- Status Badge -->
        <div class="hero-badge-pill" id="heroBadgePill">
          <span class="badge-pulse-dot"></span>
          <span class="badge-text" id="heroBadgeText">Available for Select Projects</span>
        </div>

        <!-- 3D Heading Container (H1) -->
        <h1 class="hero-3d-text-stage" id="hero3DTextContainer" aria-label="Code. Design. Impact.">
          <!-- Populated dynamically by Falling3DText -->
        </h1>

        <!-- Hero Subtitle -->
        <p class="hero-subtitle" id="heroSubtitle">
          Web development crafted for modern businesses.
        </p>

        <!-- Call to Action Buttons -->
        <div class="hero-cta-group">
          <a href="#storytellingSection" class="btn-hero-primary" id="heroCtaExplore" aria-label="Explore services">
            <span id="heroCtaExploreText">Explore</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </div>

      <!-- Scroll Down Indicator -->
      <a href="#storytellingSection" class="hero-scroll-indicator" aria-label="Scroll to services">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
      </a>
    `;
  }

  private updateTranslations(dict: TranslationDictionary): void {
    const heroData = dict.hero;

    const badgeText = this.heroElement.querySelector('#heroBadgeText');
    const subtitle = this.heroElement.querySelector('#heroSubtitle');
    const ctaExploreText = this.heroElement.querySelector('#heroCtaExploreText') || this.heroElement.querySelector('#heroCtaContactText');

    if (badgeText) badgeText.textContent = heroData.statusBadge;
    if (subtitle) subtitle.textContent = heroData.subtitle;
    if (ctaExploreText) ctaExploreText.textContent = heroData.ctaContact;
  }

  public getFallingText(): Falling3DText | null {
    return this.fallingText;
  }

  public destroy(): void {
    this.starfield?.destroy();
    this.revealSpotlight?.destroy();
  }
}
