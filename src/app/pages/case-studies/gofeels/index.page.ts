import { Component } from '@angular/core';

import { CaseStudyView } from '../../../views/case-study-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-gofeels-case-study-page',
  imports: [PageLayout, CaseStudyView],
  template: `
    <app-page-layout path="/case-studies/gofeels" language="en">
      <app-case-study-view id="gofeels" language="en" />
    </app-page-layout>
  `,
})
export default class GofeelsCaseStudyPage {}
