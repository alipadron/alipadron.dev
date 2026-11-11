import { Component } from '@angular/core';

import { LongFormView } from '../../../views/long-form-view';
import { PageLayout } from '../../../views/page-layout';

@Component({
  selector: 'app-contact-page-es',
  imports: [PageLayout, LongFormView],
  template: `
    <app-page-layout path="/contact" language="es">
      <app-long-form-view page="contact" language="es" />
    </app-page-layout>
  `,
})
export default class ContactPageEs {}
