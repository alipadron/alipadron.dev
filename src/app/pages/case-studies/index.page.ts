import { Component } from '@angular/core';

import { CaseStudiesView } from '../../views/case-studies-view';
import { PageLayout } from '../../views/page-layout';

@Component({
  selector: 'app-case-studies-page',
  imports: [PageLayout, CaseStudiesView],
  template: `
    <app-page-layout path="/case-studies" language="en">
      <app-case-studies-view language="en" />
    </app-page-layout>
  `,
})
export default class CaseStudiesPage {}
