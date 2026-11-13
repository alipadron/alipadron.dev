import { Component, input } from '@angular/core';

/**
 * The portrait on the Home page. Home renders it only once there is a real
 * photo, so there is no placeholder state.
 */
@Component({
  selector: 'app-portrait',
  styleUrl: './portrait.css',
  template: `
    <figure class="portrait">
      <img class="portrait-media" [src]="src()" [alt]="alt()" />
    </figure>
  `,
})
export class Portrait {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
}
