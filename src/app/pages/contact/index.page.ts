import { Component } from '@angular/core';

import { DocumentView } from '../../views/document-view';
import { PageLayout } from '../../views/page-layout';

@Component({
  selector: 'app-contact-page',
  imports: [PageLayout, DocumentView],
  template: `
    <app-page-layout path="/contact" language="en">
      <app-document-view page="contact" language="en" />
    </app-page-layout>
  `,
})
export default class ContactPage {}
