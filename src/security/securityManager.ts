import { i18n } from '../i18n/i18nManager';

class SecurityManager {
  private toastElement: HTMLDivElement | null = null;
  private toastTimeout: number | null = null;

  public init(): void {
    this.createProtectionToast();
    this.bindImageProtection();
    this.bindSecurityGuards();
  }

  private createProtectionToast(): void {
    if (this.toastElement) return;

    this.toastElement = document.createElement('div');
    this.toastElement.id = 'security-toast';
    this.toastElement.className = 'security-toast';
    this.toastElement.setAttribute('role', 'status');
    this.toastElement.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.toastElement);
  }

  public showProtectionNotice(x?: number, y?: number): void {
    if (!this.toastElement) return;

    const dict = i18n.getDictionary();
    this.toastElement.textContent = dict.security.imageProtected;

    // Position near cursor if provided, otherwise bottom center
    if (typeof x === 'number' && typeof y === 'number') {
      const margin = 20;
      const posX = Math.min(window.innerWidth - 320, Math.max(margin, x - 150));
      const posY = Math.min(window.innerHeight - 80, Math.max(margin, y - 50));
      this.toastElement.style.left = `${posX}px`;
      this.toastElement.style.top = `${posY}px`;
      this.toastElement.style.bottom = 'auto';
      this.toastElement.style.transform = 'translateY(0)';
    } else {
      this.toastElement.style.left = '50%';
      this.toastElement.style.top = 'auto';
      this.toastElement.style.bottom = '32px';
      this.toastElement.style.transform = 'translateX(-50%)';
    }

    this.toastElement.classList.add('visible');

    if (this.toastTimeout) {
      window.clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = window.setTimeout(() => {
      this.toastElement?.classList.remove('visible');
    }, 2200);
  }

  private bindImageProtection(): void {
    // 1. Prevent contextmenu (second-mouse click / right-click) on all images & canvas
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isProtected =
        target.tagName === 'IMG' ||
        target.tagName === 'CANVAS' ||
        target.classList.contains('protected-asset') ||
        target.closest('.hero-bg') !== null ||
        target.closest('.hero-reveal-container') !== null ||
        target.closest('canvas') !== null;

      if (isProtected) {
        e.preventDefault();
        e.stopPropagation();
        this.showProtectionNotice(e.clientX, e.clientY);
      }
    }, { capture: true });

    // 2. Prevent drag-and-drop of images
    document.addEventListener('dragstart', (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.tagName === 'CANVAS')) {
        e.preventDefault();
      }
    }, { capture: true });

    // 3. Prevent selection on visual elements
    document.addEventListener('selectstart', (e: Event) => {
      const target = (e.target instanceof Element ? e.target : (e.target as Node | null)?.parentElement) as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.tagName === 'CANVAS' || target.closest?.('.hero-universe-bg') || target.closest?.('.hero-reveal-container'))) {
        e.preventDefault();
      }
    });
  }

  private bindSecurityGuards(): void {
    // Guard against common key combinations like Ctrl+S (save webpage)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.showProtectionNotice();
      }
    });
  }

  /**
   * Sanitizes plain strings to prevent XSS / HTML injection attacks
   */
  public sanitizeHTML(str: string): string {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
}

export const security = new SecurityManager();
