import { Component } from '@angular/core';

import { DocumentView } from '../../../views/document-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-how-i-work-page-es',
  imports: [PageLayout, DocumentView],
  template: `
    <app-page-layout path="/how-i-work" language="es">
      <app-document-view page="how-i-work" language="es" />
    </app-page-layout>
  `,
})
export default class HowIWorkPageEs {}
