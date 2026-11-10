import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <main>
      <h1>Alí Padrón</h1>
      <p>Senior full-stack engineer who ships with agentic workflows.</p>
      <p><a routerLink="/experience">Read the experience</a></p>
    </main>
  `,
})
export default class HomePage {}
