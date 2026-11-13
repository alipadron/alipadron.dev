/**
 * Literals the build-level suites assert on document output. They stay here,
 * not in the content module, so the tests observe what a reader sees.
 */
/**
 * Only Tech Lead reverses the master title. Full-Stack + AI and Freelance use
 * the master title unchanged, so their entries match each other here.
 */
export const CV_TITLES = {
  en: {
    'fullstack-ai': 'Senior Full-Stack Engineer / Tech Lead',
    'tech-lead': 'Tech Lead / Senior Full-Stack Engineer',
    freelance: 'Senior Full-Stack Engineer / Tech Lead',
  },
  es: {
    'fullstack-ai': 'Ingeniero Full-Stack Senior / Líder técnico',
    'tech-lead': 'Líder técnico / Ingeniero Full-Stack Senior',
    freelance: 'Ingeniero Full-Stack Senior / Líder técnico',
  },
} as const;

/** A distinctive phrase from each variant's summary. */
export const CV_SUMMARIES = {
  en: {
    'fullstack-ai': '8+ years building and scaling web products',
    'tech-lead': 'tech lead and senior full-stack engineer with 8+ years',
    freelance: 'I take AI-built apps to production',
  },
  es: {
    'fullstack-ai': 'Trabajo con agentes de IA en el día a día',
    'tech-lead': 'Soy líder técnico e ingeniero full-stack senior',
    freelance: 'Llevo a producción aplicaciones construidas con IA',
  },
} as const;

export const CONCURRENT_LABELS = {
  en: 'Concurrent engagement',
  es: 'Compromiso simultáneo',
} as const;

export const WAREHOUSE_LINES = {
  en: 'warehouse and package-tracking system',
  es: 'sistema de almacén y rastreo de paquetes',
} as const;

/** Phrases that reveal bullet order in the real content, per language. */
export const ORDER_MARKERS = {
  en: {
    pms: 'Contribute to the full-stack development of a hotel PMS',
    release: 'Cut release time from 30+ minutes to about 7',
    techLead: 'Act as technical lead',
  },
  es: {
    pms: 'Contribuyo al desarrollo full-stack de un PMS hotelero',
    release: 'Reduje el tiempo de lanzamiento de más de 30 minutos a unos 7',
    techLead: 'Ejerzo como líder técnico',
  },
} as const;
