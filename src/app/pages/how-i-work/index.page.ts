import { Component } from '@angular/core';

import { DocumentView } from '../../views/document-view';
import { PageLayout } from '../../views/page-layout';

@Component({
  selector: 'app-how-i-work-page',
  imports: [PageLayout, DocumentView],
  template: `
    <app-page-layout path="/how-i-work" language="en">
      <app-document-view page="how-i-work" language="en" />
    </app-page-layout>
  `,
})
export default class HowIWorkPage {}
