import { Component } from '@angular/core';

import { CaseStudyView } from '../../../../views/case-study-view';
import { PageLayout } from '../../../../views/page-layout';

@Component({
  selector: 'app-gofeels-case-study-page-es',
  imports: [PageLayout, CaseStudyView],
  template: `
    <app-page-layout path="/case-studies/gofeels" language="es">
      <app-case-study-view id="gofeels" language="es" />
    </app-page-layout>
  `,
})
export default class GofeelsCaseStudyPageEs {}
