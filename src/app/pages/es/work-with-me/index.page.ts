import { Component } from '@angular/core';

import { DocumentView } from '../../../views/document-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-work-with-me-page-es',
  imports: [PageLayout, DocumentView],
  template: `
    <app-page-layout path="/work-with-me" language="es">
      <app-document-view page="work-with-me" language="es" />
    </app-page-layout>
  `,
})
export default class WorkWithMePageEs {}
