import { Component } from '@angular/core';

import { DocumentView } from '../../../views/document-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-contact-page-es',
  imports: [PageLayout, DocumentView],
  template: `
    <app-page-layout path="/contact" language="es">
      <app-document-view page="contact" language="es" />
    </app-page-layout>
  `,
})
export default class ContactPageEs {}
