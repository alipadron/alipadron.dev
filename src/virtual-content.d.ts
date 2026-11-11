declare module 'virtual:career' {
  import type { Career } from './content/schema';

  export const career: Career;
}

declare module 'virtual:ui' {
  import type { UiStrings } from './content/schema';

  export const ui: UiStrings;
}

declare module 'virtual:pages' {
  import type { Pages } from './content/schema';

  export const pages: Pages;
}

declare module 'virtual:case-studies' {
  import type { CaseStudies } from './content/schema';

  export const caseStudies: CaseStudies;
}
