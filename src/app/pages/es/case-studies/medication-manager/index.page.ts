import { Component } from '@angular/core';

import { CaseStudyView } from '../../../../views/case-study-view';
import { PageLayout } from '../../../../views/page-layout';

@Component({
  selector: 'app-medication-manager-case-study-page-es',
  imports: [PageLayout, CaseStudyView],
  template: `
    <app-page-layout path="/case-studies/medication-manager" language="es">
      <app-case-study-view id="medication-manager" language="es" />
    </app-page-layout>
  `,
})
export default class MedicationManagerCaseStudyPageEs {}
