import { i18n } from '../i18n/i18nManager';
import { TranslationDictionary } from '../types';

export class Falling3DText {
  private container: HTMLElement;
  private universeBg: HTMLElement | null;

  constructor(container: HTMLElement, universeBg: HTMLElement | null = null) {
    this.container = container;
    this.universeBg = universeBg;
    this.init();
  }

  private init(): void {
    i18n.subscribe((_lang, dict) => {
      this.render(dict);
    });
  }

  public render(dict: TranslationDictionary = i18n.getDictionary()): void {
    this.container.innerHTML = '';

    const heroData = dict.hero;
    const fullHeading = heroData.h1Words.join(' ');
    this.container.setAttribute('aria-label', fullHeading);

    // Row containing the 3D H1 words: "Code.", "Design.", "Impact."
    const row = document.createElement('div');
    row.className = 'hero-text-row hero-title-row';

    heroData.h1Words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word-3d-token token-h1';
      span.textContent = word;

      // Staggered slow fade cadence per word
      const delay = (0.2 + index * 0.22).toFixed(2);
      span.style.setProperty('--word-delay', `${delay}s`);

      row.appendChild(span);
    });

    this.container.appendChild(row);

    // Trigger universe background reveal as the title emerges
    if (this.universeBg) {
      this.universeBg.classList.remove('emerged');
      // Force reflow
      void this.universeBg.offsetWidth;
      this.universeBg.classList.add('emerged');
    }
  }
}
