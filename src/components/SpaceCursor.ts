/**
 * SpaceCursor.ts
 * Implements a celestial, zero-gravity space-like circular cursor.
 * Features:
 * - Ultra-crisp starlight celestial core dot (instant 1:1 hardware tracking).
 * - Smooth floating orbital reticle ring with zero-gravity inertia physics.
 * - Magnetic expansion & cosmic glow pulse when hovering over interactive targets.
 * - Compression shockwave on click (mousedown/mouseup).
 * - Automatic visibility toggle on window enter/leave.
 * - Hardware check: automatically disabled on touch devices to preserve native touch UX.
 */

export class SpaceCursor {
  private container: HTMLElement | null = null;
  private dot: HTMLElement | null = null;
  private ring: HTMLElement | null = null;

  // Real mouse coordinates
  private mouseX = -100;
  private mouseY = -100;

  // Smoothed orbital ring coordinates (lerp)
  private ringX = -100;
  private ringY = -100;

  private isHovered = false;
  private isClicking = false;
  private isVisible = false;
  private isFirstMove = true;
  private animFrameId: number | null = null;

  constructor() {
    // Only initialize on devices that support fine pointer and hover
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    this.createDOM();
    this.bindEvents();
    this.startLoop();
  }

  private createDOM(): void {
    // Check if already exists
    if (document.getElementById('spaceCursorContainer')) return;

    this.container = document.createElement('div');
    this.container.id = 'spaceCursorContainer';
    this.container.className = 'space-cursor-container';
    this.container.setAttribute('aria-hidden', 'true');

    // Outer orbital ring
    this.ring = document.createElement('div');
    this.ring.className = 'space-cursor-ring';

    // Inner starlight core dot
    this.dot = document.createElement('div');
    this.dot.className = 'space-cursor-dot';

    this.container.appendChild(this.ring);
    this.container.appendChild(this.dot);
    document.body.appendChild(this.container);
  }

  private bindEvents(): void {
    const onMouseMove = (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (this.isFirstMove) {
        this.isFirstMove = false;
        this.ringX = this.mouseX;
        this.ringY = this.mouseY;
        this.setVisible(true);
      } else if (!this.isVisible) {
        this.setVisible(true);
      }

      // Check hover target
      const target = e.target as HTMLElement | null;
      this.checkHoverTarget(target);
    };

    const onMouseDown = () => {
      if (this.isClicking) return;
      this.isClicking = true;
      this.ring?.classList.add('clicking');
      this.dot?.classList.add('clicking');
    };

    const onMouseUp = () => {
      if (!this.isClicking) return;
      this.isClicking = false;
      this.ring?.classList.remove('clicking');
      this.dot?.classList.remove('clicking');
    };

    const onMouseLeave = () => {
      this.setVisible(false);
    };

    const onMouseEnter = () => {
      this.setVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);
  }

  private checkHoverTarget(target: HTMLElement | null): void {
    if (!target) {
      this.setHoverState(false);
      return;
    }

    const interactiveSelector = `
      a, 
      button, 
      input, 
      textarea, 
      select, 
      [role="button"], 
      .service-card, 
      .specimen-card, 
      .chaos-item, 
      .lang-selector-btn, 
      .lang-dropdown-item, 
      .modal-specimen-close,
      .btn-modal-close,
      .btn-modal-visit-site,
      .btn-modal-dismiss-sec,
      .channel-card,
      .filter-pill,
      .matrix-link
    `;

    const isInteractive = target.closest(interactiveSelector) !== null;
    this.setHoverState(isInteractive);
  }

  private setHoverState(hovered: boolean): void {
    if (this.isHovered === hovered) return;
    this.isHovered = hovered;

    if (hovered) {
      this.ring?.classList.add('hovering');
      this.dot?.classList.add('hovering');
    } else {
      this.ring?.classList.remove('hovering');
      this.dot?.classList.remove('hovering');
    }
  }

  private setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (visible) {
      this.container?.classList.add('visible');
    } else {
      this.container?.classList.remove('visible');
    }
  }

  private startLoop(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerpFactor = prefersReducedMotion ? 1 : 0.22;

    const tick = () => {
      if (this.isVisible) {
        // Dot tracks immediately at 1:1 hardware speed for zero-latency aiming
        if (this.dot) {
          this.dot.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0)`;
        }

        // Ring follows with smooth celestial zero-gravity orbital interpolation
        const dx = this.mouseX - this.ringX;
        const dy = this.mouseY - this.ringY;

        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
          this.ringX += dx * lerpFactor;
          this.ringY += dy * lerpFactor;
        } else {
          this.ringX = this.mouseX;
          this.ringY = this.mouseY;
        }

        if (this.ring) {
          this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0)`;
        }
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.container?.remove();
  }
}
