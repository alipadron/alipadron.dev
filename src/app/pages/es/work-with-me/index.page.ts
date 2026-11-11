import { Component } from '@angular/core';

import { LongFormView } from '../../../views/long-form-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-work-with-me-page-es',
  imports: [PageLayout, LongFormView],
  template: `
    <app-page-layout path="/work-with-me" language="es">
      <app-long-form-view page="work-with-me" language="es" />
    </app-page-layout>
  `,
})
export default class WorkWithMePageEs {}
