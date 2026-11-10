import { Component } from '@angular/core';

import { HomeView } from '../views/home-view';
import { PageLayout } from '../views/page-layout';

@Component({
  selector: 'app-home-page',
  imports: [PageLayout, HomeView],
  template: `
    <app-page-layout path="/" language="en">
      <app-home-view language="en" />
    </app-page-layout>
  `,
})
export default class HomePage {}
