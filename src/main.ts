import './styles/main.css';
import { security } from './security/securityManager';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorytellingSection } from './components/StorytellingSection';
import { PortfolioUniverseSection } from './components/PortfolioUniverseSection';
import { WhoIAmSection } from './components/WhoIAmSection';
import { ContactSection } from './components/ContactSection';
import { UniverseFooter } from './components/UniverseFooter';
import { CookieConsent } from './components/CookieConsent';
import { SpaceCursor } from './components/SpaceCursor';

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize Space-Themed Custom Celestial Orbital Cursor
  new SpaceCursor();

  // 1. Initialize Security Protections (Anti-tamper, Anti-Image-Copying, Right-Click Blocker)
  security.init();

  // 2. Initialize Navigation Header & Language Switcher
  const headerElement = document.getElementById('siteHeader');
  if (headerElement) {
    new Navbar(headerElement);
  }

  // 3. Initialize Hero Section
  const heroElement = document.getElementById('heroSection');
  if (heroElement) {
    new HeroSection(heroElement);
  }

  // 4. Initialize Scroll-Driven Storytelling & Services Section
  const storyElement = document.getElementById('storytellingSection');
  if (storyElement) {
    new StorytellingSection(storyElement);
  }

  // 5. Initialize Portfolio Universe Section (Scientific Field Journal & Specimen Archive)
  const portfolioElement = document.getElementById('portfolioUniverseSection');
  if (portfolioElement) {
    new PortfolioUniverseSection(portfolioElement);
  }

  // 6. Initialize Who I Am Section (Space Console Pilot Profile & Skills)
  const whoElement = document.getElementById('whoIAmSection');
  if (whoElement) {
    new WhoIAmSection(whoElement);
  }

  // 7. Initialize Contact Section (Subspace Communication Terminal & Form)
  const contactElement = document.getElementById('contactSection');
  if (contactElement) {
    new ContactSection(contactElement);
  }

  // 8. Initialize Large Visually Striking Universe Footer
  const footerElement = document.getElementById('universeFooter');
  if (footerElement) {
    new UniverseFooter(footerElement);
  }

  // 9. Initialize GDPR Cookie & Data Compliance System
  new CookieConsent();

  console.log('⚡ ROGUE Portfolio initialized with maximum performance and security.');
});

