import { Component } from '@angular/core';

import { ExperienceView } from '../../views/experience-view';
import { PageLayout } from '../../views/page-layout';

@Component({
  selector: 'app-experience-page',
  imports: [PageLayout, ExperienceView],
  template: `
    <app-page-layout path="/experience" language="en">
      <app-experience-view language="en" />
    </app-page-layout>
  `,
})
export default class ExperiencePage {}
