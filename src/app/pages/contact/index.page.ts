import { Component } from '@angular/core';

import { LongFormView } from '../../views/long-form-view';
import { PageLayout } from '../../views/page-layout';

@Component({
  selector: 'app-contact-page',
  imports: [PageLayout, LongFormView],
  template: `
    <app-page-layout path="/contact" language="en">
      <app-long-form-view page="contact" language="en" />
    </app-page-layout>
  `,
})
export default class ContactPage {}
