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

export class WhoIAmSection {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stars: Star3D[] = [];
  private numStars: number = 440;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private fov: number = 420;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetCameraX: number = 0;
  private targetCameraY: number = 0;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private animFrameId: number | null = null;
  private isVisible: boolean = false;
  private intersectionObserver: IntersectionObserver | null = null;
  private onMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private onScrollHandler: (() => void) | null = null;
  private onResizeHandler: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    this.render();
    this.initStarfield();

    i18n.subscribe((_lang, dict) => {
      this.updateTranslations(dict);
    });
  }

  private render(): void {
    const dict = i18n.getDictionary();
    const t = dict.whoIAm;

    this.container.innerHTML = `
      <div class="who-i-am-inner">
        <!-- 3D Starfield Canvas (Continuous Cosmos covering the entire section) -->
        <canvas class="who-starfield-canvas" id="whoIAmStarfieldCanvas" aria-hidden="true"></canvas>

        <!-- Ambient Space Console Grids & Vignette -->
        <div class="who-ambient-grid" aria-hidden="true"></div>
        <div class="who-ambient-glow who-glow-1" aria-hidden="true"></div>
        <div class="who-ambient-glow who-glow-2" aria-hidden="true"></div>

        <!-- Inter-Section Cosmic Transit: Orbital Satellite & Rocket Transition -->
        <div class="orbital-transition-gateway" id="orbitalTransitGateway" aria-label="Orbital satellite and exploration vessel transition">
          <!-- Orbital Flight Arc SVG Track -->
          <div class="orbital-flight-track" aria-hidden="true">
            <svg class="flight-track-svg" viewBox="0 0 1200 140" preserveAspectRatio="none" fill="none">
              <!-- Glow backdrop track -->
              <path d="M -40 110 Q 320 20 620 75 T 1240 35" class="track-path-glow" />
              <path d="M -40 110 Q 320 20 620 75 T 1240 35" class="track-path-dashes" />
              <!-- Telemetry Waypoint Nodes -->
              <circle cx="280" cy="46" r="3.5" class="orbit-node node-alpha" />
              <circle cx="620" cy="75" r="4" class="orbit-node node-beta" />
              <circle cx="960" cy="52" r="3.5" class="orbit-node node-gamma" />
            </svg>
          </div>

          <!-- Cruising Orbital Exploration Satellite / Rocket Probe -->
          <div class="orbital-craft-vehicle" id="orbitalCraftVehicle">
            <div class="orbital-craft-inner">
              <svg class="transit-satellite-svg" viewBox="0 0 170 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="satSolarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0284c7" />
                    <stop offset="50%" stop-color="#0369a1" />
                    <stop offset="100%" stop-color="#082f49" />
                  </linearGradient>
                  <linearGradient id="satChassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff" />
                    <stop offset="35%" stop-color="#e4e4e7" />
                    <stop offset="70%" stop-color="#71717a" />
                    <stop offset="100%" stop-color="#27272a" />
                  </linearGradient>
                  <linearGradient id="ionPlumeGrad" x1="100%" y1="50%" x2="0%" y2="50%">
                    <stop offset="0%" stop-color="#38bdf8" stop-opacity="1" />
                    <stop offset="35%" stop-color="#00f0ff" stop-opacity="0.9" />
                    <stop offset="70%" stop-color="#0284c7" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
                  </linearGradient>
                  <filter id="plumeGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <!-- Ion Thruster Flame Plume (Propulsion exhaust) -->
                <g class="sat-thrust-group">
                  <ellipse cx="22" cy="47.5" rx="22" ry="7.5" fill="url(#ionPlumeGrad)" filter="url(#plumeGlow)" class="sat-plume-outer" />
                  <ellipse cx="30" cy="47.5" rx="14" ry="4" fill="#e0f2fe" filter="url(#plumeGlow)" class="sat-plume-inner" />
                  <line x1="32" y1="47.5" x2="6" y2="47.5" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round" class="sat-thrust-core" />
                </g>

                <!-- Left Solar Array Wing -->
                <g class="sat-solar-left">
                  <rect x="66" y="9" width="36" height="25" rx="2" fill="url(#satSolarGrad)" stroke="#38bdf8" stroke-width="0.8" />
                  <line x1="78" y1="9" x2="78" y2="34" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" />
                  <line x1="90" y1="9" x2="90" y2="34" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" />
                  <line x1="66" y1="17" x2="102" y2="17" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
                  <line x1="66" y1="25" x2="102" y2="25" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
                  <rect x="81" y="34" width="6" height="5.5" fill="#a1a1aa" />
                </g>

                <!-- Right Solar Array Wing -->
                <g class="sat-solar-right">
                  <rect x="66" y="60.5" width="36" height="25" rx="2" fill="url(#satSolarGrad)" stroke="#38bdf8" stroke-width="0.8" />
                  <line x1="78" y1="60.5" x2="78" y2="85.5" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" />
                  <line x1="90" y1="60.5" x2="90" y2="85.5" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" />
                  <line x1="66" y1="68.5" x2="102" y2="68.5" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
                  <line x1="66" y1="76.5" x2="102" y2="76.5" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
                  <rect x="81" y="55" width="6" height="5.5" fill="#a1a1aa" />
                </g>

                <!-- Main Fuselage / Aerospace Chassis -->
                <g class="sat-chassis">
                  <!-- Engine nozzle -->
                  <rect x="44" y="43" width="7" height="9" rx="1" fill="#52525b" stroke="#71717a" stroke-width="0.6" />
                  <!-- Fuselage -->
                  <rect x="51" y="39" width="60" height="17" rx="4" fill="url(#satChassisGrad)" stroke="rgba(255,255,255,0.85)" stroke-width="0.8" />
                  <!-- Nose cone -->
                  <path d="M111 41 L126 47.5 L111 54 Z" fill="#ffffff" stroke="rgba(255,255,255,0.9)" stroke-width="0.8" />
                  <!-- High-tech panel inserts -->
                  <rect x="56" y="41.5" width="13" height="12" rx="1.5" fill="#18181b" stroke="#3f3f46" stroke-width="0.5" />
                  <rect x="72" y="42" width="20" height="11" rx="1" fill="#27272a" />
                  <circle cx="102" cy="47.5" r="2.8" fill="#00f0ff" class="sat-core-glow" />
                  <!-- Communications Dish Antenna -->
                  <path d="M96 33.5 Q105 26 114 33.5" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" />
                  <line x1="105" y1="29.5" x2="105" y2="39" stroke="#e4e4e7" stroke-width="1.3" />
                  <circle cx="105" cy="28" r="1.8" fill="#38bdf8" />
                  <!-- Flashing Navigation Strobe Beacon -->
                  <circle cx="126" cy="47.5" r="2.5" fill="#22c55e" class="sat-beacon-strobe" />
                </g>
              </svg>

              <!-- Futuristic Live Telemetry Label -->
              <div class="transit-telemetry-tag">
                <span class="transit-ping-dot"></span>
                <span class="transit-tag-text">ORBITAL RELAY // SAT-ROGUE-04 · IN TRANSIT</span>
              </div>
            </div>
          </div>

          <!-- Subtle Transition Nav HUD -->
          <div class="transit-hud-bar">
            <span class="transit-hud-code">// SECTOR_TRANSIT: PORTFOLIO_UNIVERSE ──► PILOT_CONSOLE</span>
            <div class="transit-chevron-indicator" aria-hidden="true">
              <span class="transit-chevron">↓</span>
              <span class="transit-chevron">↓</span>
            </div>
            <span class="transit-hud-code">VECTOR: 340° // TRAJECTORY: SYNCHRONOUS</span>
          </div>
        </div>

        <!-- Section Header -->
        <header class="who-header">
          <div class="who-tag-badge">
            <span class="who-pulse-dot"></span>
            <span class="who-badge-text" id="whoTagBadge">${t.tag}</span>
          </div>
          <h2 class="section-heading-3d who-i-am-title" id="whoTitle">
            ${t.title}
          </h2>
          <p class="who-subtitle" id="whoSubtitle">
            ${t.subtitle}
          </p>
        </header>

        <!-- Main Space Console Dashboard & Floating Cosmic Fauna -->
        <div class="console-dashboard-container">
          <!-- 5 Floating Creatures on Planets decorating dashboard surroundings -->
          <div class="floating-creatures-group" aria-hidden="true">
            <!-- Creature 1: Robot on blue planet with Saturn rings -->
            <div class="floating-creature-item creature-item-1" title="Cosmic Creature 01">
              <img 
                src="/img/creature-on-planet-1.png" 
                alt="Creature on planet 1" 
                class="creature-planet-img protected-asset" 
                draggable="false"
                loading="lazy" 
              />
            </div>

            <!-- Creature 2: Mini robot on pink planet -->
            <div class="floating-creature-item creature-item-2" title="Cosmic Creature 02">
              <img 
                src="/img/creature-on-planet-2.png" 
                alt="Creature on planet 2" 
                class="creature-planet-img protected-asset" 
                draggable="false"
                loading="lazy" 
              />
            </div>

            <!-- Creature 3: Blue furry creature on yellow planet -->
            <div class="floating-creature-item creature-item-3" title="Cosmic Creature 03">
              <img 
                src="/img/creature-on-planet-3.png" 
                alt="Creature on planet 3" 
                class="creature-planet-img protected-asset" 
                draggable="false"
                loading="lazy" 
              />
            </div>

            <!-- Creature 4: Otter on green planet with cottage and lake -->
            <div class="floating-creature-item creature-item-4" title="Cosmic Creature 04">
              <img 
                src="/img/creature-on-planet-4.png" 
                alt="Creature on planet 4" 
                class="creature-planet-img protected-asset" 
                draggable="false"
                loading="lazy" 
              />
            </div>

            <!-- Creature 5: Fire spirit on purple planet -->
            <div class="floating-creature-item creature-item-5" title="Cosmic Creature 05">
              <img 
                src="/img/creature-on-planet-5.png" 
                alt="Creature on planet 5" 
                class="creature-planet-img protected-asset" 
                draggable="false"
                loading="lazy" 
              />
            </div>
          </div>

          <!-- Main Space Console Shell -->
          <div class="space-console-frame" id="spaceConsoleFrame">
          <!-- Console Top HUD Status Bar -->
          <div class="console-top-hud">
            <div class="hud-left-group">
              <span class="hud-dot hud-dot-green"></span>
              <span class="hud-dot hud-dot-white"></span>
              <span class="hud-dot hud-dot-gray"></span>
              <span class="hud-title">PILOT_STATION // JEKCERES.SYS</span>
            </div>
            <div class="hud-center-telemetry">
              <span class="hud-bracket">[</span>
              <span class="hud-status-text">STATUS: DEPLOYED // READY FOR HIGH-IMPACT ARCHITECTURES</span>
              <span class="hud-bracket">]</span>
            </div>
            <div class="hud-right-telemetry">
              <span class="hud-freq">FREQ: 144.20 MHz</span>
              <span class="hud-coords">SYS_LATENCY: 0.12ms</span>
            </div>
          </div>

          <!-- Upper Console Deck: Photo on Left, Bio on Right -->
          <div class="console-deck">
            <!-- Left Deck: Circular Photo & Operator Credentials -->
            <div class="console-deck-left">
              <div class="orbital-portrait-wrapper">
                <!-- Rotating Orbital Compass Rings -->
                <div class="orbital-ring orbital-ring-outer" aria-hidden="true"></div>
                <div class="orbital-ring orbital-ring-inner" aria-hidden="true"></div>
                <div class="orbital-ring orbital-ring-pulse" aria-hidden="true"></div>

                <!-- Circular Photo Frame -->
                <div class="orbital-photo-frame">
                  <img 
                    src="/img/jesus-caceres.jpeg" 
                    alt="${t.operatorName} - Front-End Web Developer" 
                    class="console-portrait-img protected-asset"
                    id="whoProfileImg"
                    draggable="false"
                    loading="lazy"
                  />
                  <div class="orbital-scanlines" aria-hidden="true"></div>
                </div>
              </div>

              <!-- Operator ID & Credentials (Space Console Badges) -->
              <div class="console-operator-info">
                <h3 class="operator-name" id="whoOperatorName">${t.operatorName}</h3>
                <p class="operator-role" id="whoOperatorRole">${t.operatorRole}</p>

                <div class="operator-status-badge">
                  <span class="status-live-dot"></span>
                  <span id="whoStatusActive">${t.statusActive}</span>
                </div>

                <div class="console-credentials-stack">
                  <!-- Lindenwood University Graduate Badge (Without mentioning degree title as requested) -->
                  <div class="cred-badge-item cred-lindenwood">
                    <div class="cred-badge-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
                      </svg>
                    </div>
                    <div class="cred-badge-content">
                      <span class="cred-badge-title" id="whoEducationLindenwood">${t.educationLindenwood}</span>
                      <span class="cred-badge-meta" id="whoEducationLindenwoodMeta">${t.educationLindenwoodMeta}</span>
                    </div>
                  </div>

                  <!-- 4Geeks Academy Badge -->
                  <div class="cred-badge-item cred-fourgeeks">
                    <div class="cred-badge-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                    </div>
                    <div class="cred-badge-content">
                      <span class="cred-badge-title" id="whoEducation4Geeks">${t.education4Geeks}</span>
                      <span class="cred-badge-meta" id="whoEducation4GeeksMeta">${t.education4GeeksMeta}</span>
                    </div>
                  </div>

                  <!-- Agency Leadership Metric Badge -->
                  <div class="cred-badge-item cred-agency">
                    <div class="cred-badge-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <div class="cred-badge-content">
                      <span class="cred-badge-title" id="whoAgencyExp">${t.agencyExp}</span>
                      <span class="cred-badge-meta" id="whoAgencyExpMeta">${t.agencyExpMeta}</span>
                    </div>
                  </div>

                  <!-- Provitared Health-Tech Co-Founder Badge -->
                  <div class="cred-badge-item cred-provitared">
                    <div class="cred-badge-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                      </svg>
                    </div>
                    <div class="cred-badge-content">
                      <span class="cred-badge-title" id="whoProvitaredExp">${t.provitaredExp}</span>
                      <span class="cred-badge-meta" id="whoProvitaredExpMeta">${t.provitaredExpMeta}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Deck: Bio Transmission Card -->
            <div class="console-deck-right">
              <div class="console-bio-box">
                <div class="console-box-header">
                  <div class="box-header-title">
                    <span class="terminal-symbol">&gt;</span>
                    <span id="whoBioHeading">${t.bioHeading}</span>
                  </div>
                  <span class="box-status-tag">SECURE // ENCRYPTED_TLS</span>
                </div>

                <div class="console-bio-body">
                  <p class="bio-paragraph bio-lead" id="whoBioP1">${t.bioP1}</p>

                  <div class="bio-quote-callout">
                    <div class="quote-accent-bar"></div>
                    <blockquote class="bio-quote-text" id="whoBioP2">${t.bioP2}</blockquote>
                  </div>

                  <p class="bio-paragraph" id="whoBioP3">${t.bioP3}</p>
                </div>

                <!-- Console Telemetry Footnote -->
                <div class="console-box-footer">
                  <span class="footer-telemetry-item">LOC: CARACAS // REMOTE_GLOBAL</span>
                  <span class="footer-telemetry-item">AVAILABILITY: OPEN FOR HIGH-TIER CLIENTS</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Lower Console Deck: Skills Telemetry Console (Below Text) -->
          <div class="console-skills-deck">
            <div class="skills-deck-header">
              <div class="skills-tag-group">
                <span class="skills-chip-tag">// SYSTEM ARSENAL</span>
                <span class="skills-status-live">MOD_LOAD: 100%</span>
              </div>
              <h3 class="skills-headline" id="whoSkillsHeader">${t.skillsHeader}</h3>
              <p class="skills-subheadline" id="whoSkillsSub">${t.skillsSub}</p>
            </div>

            <!-- 4 Space Console Module Cards -->
            <div class="skills-modules-grid">
              <!-- Module 1: Front-End Architecture -->
              <div class="skill-module-card module-card-1" style="--card-delay: 0s;">
                <div class="module-card-header">
                  <div class="module-code-pill">
                    <span class="module-indicator"></span>
                    <span>${t.modules.frontend.code}</span>
                  </div>
                  <h4 class="module-name" id="modNameFrontend">${t.modules.frontend.name}</h4>
                </div>
                <div class="module-tags-cluster" id="modTagsFrontend">
                  ${t.modules.frontend.tags.map(tag => `<span class="skill-chip">${tag}</span>`).join('')}
                </div>
              </div>

              <!-- Module 2: Back-End & CMS Systems -->
              <div class="skill-module-card module-card-2" style="--card-delay: 0.15s;">
                <div class="module-card-header">
                  <div class="module-code-pill">
                    <span class="module-indicator"></span>
                    <span>${t.modules.backend.code}</span>
                  </div>
                  <h4 class="module-name" id="modNameBackend">${t.modules.backend.name}</h4>
                </div>
                <div class="module-tags-cluster" id="modTagsBackend">
                  ${t.modules.backend.tags.map(tag => `<span class="skill-chip">${tag}</span>`).join('')}
                </div>
              </div>

              <!-- Module 3: Performance, Delivery & Security -->
              <div class="skill-module-card module-card-3" style="--card-delay: 0.3s;">
                <div class="module-card-header">
                  <div class="module-code-pill">
                    <span class="module-indicator"></span>
                    <span>${t.modules.quality.code}</span>
                  </div>
                  <h4 class="module-name" id="modNameQuality">${t.modules.quality.name}</h4>
                </div>
                <div class="module-tags-cluster" id="modTagsQuality">
                  ${t.modules.quality.tags.map(tag => `<span class="skill-chip">${tag}</span>`).join('')}
                </div>
              </div>

              <!-- Module 4: AI-Assisted & Agentic Engineering -->
              <div class="skill-module-card module-card-4" style="--card-delay: 0.45s;">
                <div class="module-card-header">
                  <div class="module-code-pill">
                    <span class="module-indicator"></span>
                    <span>${t.modules.ai.code}</span>
                  </div>
                  <h4 class="module-name" id="modNameAi">${t.modules.ai.name}</h4>
                </div>
                <div class="module-tags-cluster" id="modTagsAi">
                  ${t.modules.ai.tags.map(tag => `<span class="skill-chip">${tag}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Console Edge Decal -->
          <div class="console-bottom-decal">
            <span class="decal-hash">///</span>
            <span class="decal-text">LINDENWOOD_ALUMNUS · 4GEEKS_FULLSTACK · 150_PLATFORMS_MANAGED</span>
            <span class="decal-hash">///</span>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  private updateTranslations(dict: TranslationDictionary): void {
    const t = dict.whoIAm;

    const tagBadge = this.container.querySelector('#whoTagBadge');
    const title = this.container.querySelector('#whoTitle');
    const subtitle = this.container.querySelector('#whoSubtitle');
    const operatorName = this.container.querySelector('#whoOperatorName');
    const operatorRole = this.container.querySelector('#whoOperatorRole');
    const statusActive = this.container.querySelector('#whoStatusActive');
    const eduLindenwood = this.container.querySelector('#whoEducationLindenwood');
    const eduLindenwoodMeta = this.container.querySelector('#whoEducationLindenwoodMeta');
    const edu4Geeks = this.container.querySelector('#whoEducation4Geeks');
    const edu4GeeksMeta = this.container.querySelector('#whoEducation4GeeksMeta');
    const agencyExp = this.container.querySelector('#whoAgencyExp');
    const agencyExpMeta = this.container.querySelector('#whoAgencyExpMeta');
    const provitaredExp = this.container.querySelector('#whoProvitaredExp');
    const provitaredExpMeta = this.container.querySelector('#whoProvitaredExpMeta');
    const bioHeading = this.container.querySelector('#whoBioHeading');
    const bioP1 = this.container.querySelector('#whoBioP1');
    const bioP2 = this.container.querySelector('#whoBioP2');
    const bioP3 = this.container.querySelector('#whoBioP3');
    const skillsHeader = this.container.querySelector('#whoSkillsHeader');
    const skillsSub = this.container.querySelector('#whoSkillsSub');

    if (tagBadge) tagBadge.textContent = t.tag;
    if (title) title.textContent = t.title;
    if (subtitle) subtitle.textContent = t.subtitle;
    if (operatorName) operatorName.textContent = t.operatorName;
    if (operatorRole) operatorRole.textContent = t.operatorRole;
    if (statusActive) statusActive.textContent = t.statusActive;
    if (eduLindenwood) eduLindenwood.textContent = t.educationLindenwood;
    if (eduLindenwoodMeta) eduLindenwoodMeta.textContent = t.educationLindenwoodMeta;
    if (edu4Geeks) edu4Geeks.textContent = t.education4Geeks;
    if (edu4GeeksMeta) edu4GeeksMeta.textContent = t.education4GeeksMeta;
    if (agencyExp) agencyExp.textContent = t.agencyExp;
    if (agencyExpMeta) agencyExpMeta.textContent = t.agencyExpMeta;
    if (provitaredExp) provitaredExp.textContent = t.provitaredExp;
    if (provitaredExpMeta) provitaredExpMeta.textContent = t.provitaredExpMeta;
    if (bioHeading) bioHeading.textContent = t.bioHeading;
    if (bioP1) bioP1.textContent = t.bioP1;
    if (bioP2) bioP2.textContent = t.bioP2;
    if (bioP3) bioP3.textContent = t.bioP3;
    if (skillsHeader) skillsHeader.textContent = t.skillsHeader;
    if (skillsSub) skillsSub.textContent = t.skillsSub;

    const modNameFrontend = this.container.querySelector('#modNameFrontend');
    const modTagsFrontend = this.container.querySelector('#modTagsFrontend');
    if (modNameFrontend) modNameFrontend.textContent = t.modules.frontend.name;
    if (modTagsFrontend) {
      modTagsFrontend.innerHTML = t.modules.frontend.tags.map(tag => `<span class="skill-chip">${tag}</span>`).join('');
    }

    const modNameBackend = this.container.querySelector('#modNameBackend');
    const modTagsBackend = this.container.querySelector('#modTagsBackend');
    if (modNameBackend) modNameBackend.textContent = t.modules.backend.name;
    if (modTagsBackend) {
      modTagsBackend.innerHTML = t.modules.backend.tags.map(tag => `<span class="skill-chip">${tag}</span>`).join('');
    }

    const modNameQuality = this.container.querySelector('#modNameQuality');
    const modTagsQuality = this.container.querySelector('#modTagsQuality');
    if (modNameQuality) modNameQuality.textContent = t.modules.quality.name;
    if (modTagsQuality) {
      modTagsQuality.innerHTML = t.modules.quality.tags.map(tag => `<span class="skill-chip">${tag}</span>`).join('');
    }

    const modNameAi = this.container.querySelector('#modNameAi');
    const modTagsAi = this.container.querySelector('#modTagsAi');
    if (modNameAi) modNameAi.textContent = t.modules.ai.name;
    if (modTagsAi) {
      modTagsAi.innerHTML = t.modules.ai.tags.map(tag => `<span class="skill-chip">${tag}</span>`).join('');
    }
  }

  /* --------------------------------------------------------------------------
     3D Starfield Continuous Cosmos Engine (Resembling Universe Across Section)
     -------------------------------------------------------------------------- */
  private initStarfield(): void {
    this.canvas = this.container.querySelector('#whoIAmStarfieldCanvas');
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
      this.targetCameraX = (this.mouseX / halfW) * 30;
      this.targetCameraY = (this.mouseY / halfH) * 20;
    };
    window.addEventListener('mousemove', this.onMouseMoveHandler, { passive: true });

    this.onScrollHandler = () => {
      // Dynamic scroll parallax is computed in renderStarfield loop
    };
    window.addEventListener('scroll', this.onScrollHandler, { passive: true });

    // IntersectionObserver with generous margins to keep stars continuous
    this.intersectionObserver = new IntersectionObserver(
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
    this.intersectionObserver.observe(this.container);
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
      if (colorRoll > 0.84) {
        colorType = 'cyan';
      } else if (colorRoll > 0.70) {
        colorType = 'gold';
      }

      this.stars.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: Math.random() * maxZ + 1,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        vz: -0.22 - Math.random() * 0.35,
        radius: 0.6 + Math.random() * 1.35,
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

    // Parallax scroll calculation relative to About me section
    const rect = this.container.getBoundingClientRect();
    const totalDist = rect.height - window.innerHeight;
    const scrollFactor = totalDist > 0 ? Math.max(0, Math.min(1, -rect.top / totalDist)) : 0;
    const scrollOffsetY = (scrollFactor - 0.5) * 300;

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
