export type SupportedLanguage = 'en' | 'es' | 'fr' | 'pt';

export interface TranslationDictionary {
  nav: {
    brand: string;
    services: string;
    portfolio: string;
    whoIAm: string;
    contact: string;
    langSelectAria: string;
  };
  hero: {
    h1Words: string[];
    subtitle: string;
    roleTitle: string;
    roleDescription: string;
    ctaProjects: string;
    ctaContact: string;
    revealHint: string;
    statusBadge: string;
  };
  story: {
    chaosNotes: {
      note1: string;
      note2: string;
      note3: string;
      note4: string;
    };
    servicesHeader: {
      tag: string;
      title: string;
      subtitle: string;
    };
    services: {
      info: {
        title: string;
        tag: string;
        description: string;
        cta: string;
        waMessage: string;
      };
      ecom: {
        title: string;
        tag: string;
        description: string;
        cta: string;
        waMessage: string;
      };
      apps: {
        title: string;
        tag: string;
        description: string;
        cta: string;
        waMessage: string;
      };
    };
    whatsappCart: {
      title: string;
      sendBtn: string;
      sendBtnMobile?: string;
      dismiss: string;
    };
  };
  gdpr: {
    title: string;
    description: string;
    acceptAll: string;
    rejectNonEssential: string;
    customize: string;
    save: string;
    modalTitle: string;
    modalDescription: string;
    essentialTitle: string;
    essentialDesc: string;
    essentialStatus: string;
    functionalTitle: string;
    functionalDesc: string;
    close: string;
  };
  security: {
    imageProtected: string;
  };
  portfolio: {
    headerTag: string;
    title: string;
    subtitle: string;
    fieldJournal: string;
    visitSite: string;
    modalExplore: string;
    modalClose: string;
    modalSector: string;
    ctaHeadline: string;
    ctaSubtitle: string;
    ctaButton: string;
    items: {
      alfombras: {
        name: string;
        category: string;
        sector: string;
        coordinates: string;
        shortDesc: string;
        fullDesc: string;
      };
      partinha: {
        name: string;
        category: string;
        sector: string;
        coordinates: string;
        shortDesc: string;
        fullDesc: string;
      };
      ohiru: {
        name: string;
        category: string;
        sector: string;
        coordinates: string;
        shortDesc: string;
        fullDesc: string;
      };
      sonrie: {
        name: string;
        category: string;
        sector: string;
        coordinates: string;
        shortDesc: string;
        fullDesc: string;
      };
      northstar: {
        name: string;
        category: string;
        sector: string;
        coordinates: string;
        shortDesc: string;
        fullDesc: string;
      };
      hemz: {
        name: string;
        category: string;
        sector: string;
        coordinates: string;
        shortDesc: string;
        fullDesc: string;
      };
      oceanside: {
        name: string;
        category: string;
        sector: string;
        coordinates: string;
        shortDesc: string;
        fullDesc: string;
      };
      nuestroquiro: {
        name: string;
        category: string;
        sector: string;
        coordinates: string;
        shortDesc: string;
        fullDesc: string;
      };
    };
  };
  whoIAm: {
    tag: string;
    title: string;
    subtitle: string;
    operatorName: string;
    operatorRole: string;
    statusActive: string;
    educationLindenwood: string;
    educationLindenwoodMeta: string;
    education4Geeks: string;
    education4GeeksMeta: string;
    agencyExp: string;
    agencyExpMeta: string;
    provitaredExp: string;
    provitaredExpMeta: string;
    bioHeading: string;
    bioP1: string;
    bioP2: string;
    bioP3: string;
    skillsHeader: string;
    skillsSub: string;
    modules: {
      frontend: {
        code: string;
        name: string;
        tags: string[];
      };
      backend: {
        code: string;
        name: string;
        tags: string[];
      };
      quality: {
        code: string;
        name: string;
        tags: string[];
      };
      ai: {
        code: string;
        name: string;
        tags: string[];
      };
    };
  };
  contact: {
    tag: string;
    title: string;
    subtitle: string;
    whatsAppLabel: string;
    whatsAppHeadline: string;
    whatsAppSubtext: string;
    whatsAppBtnText: string;
    emailLabel: string;
    emailSubtext: string;
    emailBtnText: string;
    selectedServiceTitle: string;
    noServiceSelected: string;
    changeService: string;
    formTitle: string;
    formSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    contactLabel: string;
    contactPlaceholder: string;
    serviceCategoryLabel: string;
    servicesOptions: {
      info: string;
      ecom: string;
      apps: string;
      custom: string;
    };
    messageLabel: string;
    messagePlaceholder: string;
    submitBtnText: string;
    submitHint: string;
    toastSent: string;
  };
  footer: {
    brandWordmark: string;
    plateNumber: string;
    telemetryCoordinates: string;
    colophonMotto: string;
    navDirectoryTitle: string;
    navServices: string;
    navPortfolio: string;
    navAboutMe: string;
    navContact: string;
    beaconsTitle: string;
    beaconWhatsApp: string;
    beaconEmail: string;
    telemetryTitle: string;
    originCity: string;
    statusActive: string;
    backToTop: string;
    copyright: string;
  };
}

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  consentGiven: boolean;
  timestamp: number;
}
