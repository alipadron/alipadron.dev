import { Component } from '@angular/core';

import { ExperienceView } from '../../../views/experience-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-experience-page-es',
  imports: [PageLayout, ExperienceView],
  template: `
    <app-page-layout path="/experience" language="es">
      <app-experience-view language="es" />
    </app-page-layout>
  `,
})
export default class ExperiencePageEs {}
