export class RevealSpotlight {
  private heroElement: HTMLElement;
  private revealContainer: HTMLElement;
  private targetX: number = -1000;
  private targetY: number = -1000;
  private currentX: number = -1000;
  private currentY: number = -1000;
  private isPointerInside: boolean = false;
  private animFrameId: number | null = null;
  private readonly radius: number = 260; // Exact 260px requirement
  private readonly lerpFactor: number = 0.12; // Smooth easing/lerp

  // Event handlers saved for disposal
  private onPointerMoveHandler: ((e: PointerEvent) => void) | null = null;
  private onMouseLeaveHandler: ((e: MouseEvent) => void) | null = null;
  private onBlurHandler: (() => void) | null = null;
  private onTouchMoveHandler: ((e: TouchEvent) => void) | null = null;
  private onTouchEndHandler: (() => void) | null = null;

  constructor(heroElement: HTMLElement, revealContainer: HTMLElement) {
    this.heroElement = heroElement;
    this.revealContainer = revealContainer;
    this.init();
  }

  private init(): void {
    // Initial mask state
    this.applyMask(-1000, -1000);
    this.revealContainer.style.opacity = '0';
    this.revealContainer.style.pointerEvents = 'none';

    this.bindEvents();
    this.startLoop();
  }

  private bindEvents(): void {
    this.onPointerMoveHandler = (e: PointerEvent) => {
      const rect = this.heroElement.getBoundingClientRect();

      // Check if cursor is within hero viewport boundaries (including fixed navbar & top-right corner)
      const isWithinHero = (
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      );

      if (isWithinHero) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.targetX = x;
        this.targetY = y;

        if (!this.isPointerInside) {
          this.isPointerInside = true;
          this.currentX = x;
          this.currentY = y;
          this.applyMask(this.currentX, this.currentY);
          this.revealContainer.style.opacity = '1';
        }
      } else {
        if (this.isPointerInside) {
          this.isPointerInside = false;
          this.revealContainer.style.opacity = '0';
        }
      }
    };

    this.onMouseLeaveHandler = (e: MouseEvent) => {
      // Hide completely when the mouse exits the browser window
      if (!e.relatedTarget && (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        this.isPointerInside = false;
        this.revealContainer.style.opacity = '0';
      }
    };

    this.onBlurHandler = () => {
      this.isPointerInside = false;
      this.revealContainer.style.opacity = '0';
    };

    // Global listeners ensure continuous tracking even when hovering over fixed navbar elements
    window.addEventListener('pointermove', this.onPointerMoveHandler, { passive: true });
    document.addEventListener('mouseleave', this.onMouseLeaveHandler);
    window.addEventListener('blur', this.onBlurHandler);

    // Touch device support
    this.onTouchMoveHandler = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.heroElement.getBoundingClientRect();
        const isWithinHero = (
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom &&
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right
        );

        if (isWithinHero) {
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;

          this.targetX = x;
          this.targetY = y;

          if (!this.isPointerInside) {
            this.isPointerInside = true;
            this.currentX = x;
            this.currentY = y;
            this.revealContainer.style.opacity = '1';
          }
        } else {
          if (this.isPointerInside) {
            this.isPointerInside = false;
            this.revealContainer.style.opacity = '0';
          }
        }
      }
    };

    this.onTouchEndHandler = () => {
      this.isPointerInside = false;
      this.revealContainer.style.opacity = '0';
    };

    window.addEventListener('touchmove', this.onTouchMoveHandler, { passive: true });
    window.addEventListener('touchend', this.onTouchEndHandler);
  }

  private startLoop(): void {
    const update = () => {
      if (this.isPointerInside) {
        // Smooth lerp formula: current += (target - current) * factor
        const dx = this.targetX - this.currentX;
        const dy = this.targetY - this.currentY;

        this.currentX += dx * this.lerpFactor;
        this.currentY += dy * this.lerpFactor;

        this.applyMask(this.currentX, this.currentY);
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  private applyMask(x: number, y: number): void {
    // 260px radius spotlight with soft feathered glowing gradient edge and explicit transparent boundary
    const maskGradient = `radial-gradient(circle ${this.radius}px at ${x.toFixed(2)}px ${y.toFixed(2)}px, black 0%, black 140px, rgba(0, 0, 0, 0.7) 205px, rgba(0, 0, 0, 0.25) 245px, transparent ${this.radius}px, transparent 100%)`;

    this.revealContainer.style.maskImage = maskGradient;
    this.revealContainer.style.webkitMaskImage = maskGradient;
  }

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.onPointerMoveHandler) {
      window.removeEventListener('pointermove', this.onPointerMoveHandler);
    }
    if (this.onMouseLeaveHandler) {
      document.removeEventListener('mouseleave', this.onMouseLeaveHandler);
    }
    if (this.onBlurHandler) {
      window.removeEventListener('blur', this.onBlurHandler);
    }
    if (this.onTouchMoveHandler) {
      window.removeEventListener('touchmove', this.onTouchMoveHandler);
    }
    if (this.onTouchEndHandler) {
      window.removeEventListener('touchend', this.onTouchEndHandler);
    }
  }
}
