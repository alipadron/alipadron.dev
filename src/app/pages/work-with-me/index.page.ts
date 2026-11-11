import { Component } from '@angular/core';

import { DocumentView } from '../../views/document-view';
import { PageLayout } from '../../views/page-layout';

@Component({
  selector: 'app-work-with-me-page',
  imports: [PageLayout, DocumentView],
  template: `
    <app-page-layout path="/work-with-me" language="en">
      <app-document-view page="work-with-me" language="en" />
    </app-page-layout>
  `,
})
export default class WorkWithMePage {}
