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
    'fullstack-ai': 'Ingeniero Full-Stack Senior / Tech Lead',
    'tech-lead': 'Tech Lead / Ingeniero Full-Stack Senior',
    freelance: 'Ingeniero Full-Stack Senior / Tech Lead',
  },
} as const;

/** A distinctive phrase from each variant's summary. */
export const CV_SUMMARIES = {
  en: {
    'fullstack-ai': 'Senior full-stack engineer with 8+ years building and scaling',
    'tech-lead': 'Owns releases, production migrations, the self-hosted GitLab',
    freelance: 'I take AI-built apps to production',
  },
  es: {
    'fullstack-ai': 'Trabaja con agentes de IA como parte del método',
    'tech-lead': 'Es responsable de los releases, las migraciones en producción',
    freelance: 'Llevo a producción aplicaciones construidas con IA',
  },
} as const;

export const CONCURRENT_LABELS = {
  en: 'Concurrent engagement',
  es: 'Compromiso simultáneo',
} as const;

export const PAYMENTS_LINES = {
  en: 'tens of thousands of online payments a year',
  es: 'decenas de miles de pagos en línea al año',
} as const;

/** Phrases that reveal bullet order in the real content, per language. */
export const ORDER_MARKERS = {
  en: {
    pms: 'Lead full-stack delivery of a hotel PMS',
    security: 'Ran a proactive security hardening program',
    agentic: 'Act as technical lead',
    sharedCi: 'Extracted shared CI components',
  },
  es: {
    pms: 'Lidera el desarrollo full-stack de un PMS hotelero',
    security: 'Ejecutó un programa proactivo de endurecimiento de seguridad',
    agentic: 'Ejerce como líder técnico',
    sharedCi: 'Extrajo componentes de CI compartidos',
  },
} as const;
