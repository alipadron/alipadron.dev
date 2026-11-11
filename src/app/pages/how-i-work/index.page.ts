import { Component } from '@angular/core';

import { LongFormView } from '../../views/long-form-view';
import { PageLayout } from '../../views/page-layout';

@Component({
  selector: 'app-how-i-work-page',
  imports: [PageLayout, LongFormView],
  template: `
    <app-page-layout path="/how-i-work" language="en">
      <app-long-form-view page="how-i-work" language="en" />
    </app-page-layout>
  `,
})
export default class HowIWorkPage {}
