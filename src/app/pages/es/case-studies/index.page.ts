import { Component } from '@angular/core';

import { CaseStudiesView } from '../../../views/case-studies-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-case-studies-page-es',
  imports: [PageLayout, CaseStudiesView],
  template: `
    <app-page-layout path="/case-studies" language="es">
      <app-case-studies-view language="es" />
    </app-page-layout>
  `,
})
export default class CaseStudiesPageEs {}
