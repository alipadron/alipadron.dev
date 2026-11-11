import { Component } from '@angular/core';

import { CaseStudyView } from '../../../views/case-study-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-car-log-case-study-page',
  imports: [PageLayout, CaseStudyView],
  template: `
    <app-page-layout path="/case-studies/car-log" language="en">
      <app-case-study-view id="car-log" language="en" />
    </app-page-layout>
  `,
})
export default class CarLogCaseStudyPage {}
