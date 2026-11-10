import { Component } from '@angular/core';

import { HomeView } from '../../views/home-view';
import { PageLayout } from '../../views/page-layout';

@Component({
  selector: 'app-home-page-es',
  imports: [PageLayout, HomeView],
  template: `
    <app-page-layout path="/" language="es">
      <app-home-view language="es" />
    </app-page-layout>
  `,
})
export default class HomePageEs {}
