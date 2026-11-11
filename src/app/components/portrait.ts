import { Component, input } from '@angular/core';

/**
 * The reserved portrait slot on the Home page. Passing `src` swaps the
 * placeholder for a real image; the frame keeps its 3:2 phone / 4:5 desktop
 * ratio either way, so the hero does not jump when the photo arrives.
 */
@Component({
  selector: 'app-portrait',
  styleUrl: './portrait.css',
  template: `
    <figure class="portrait">
      @if (src(); as source) {
        <img class="portrait-media" [src]="source" [alt]="alt()" />
      } @else {
        <div
          class="portrait-media portrait-frame"
          role="img"
          [attr.aria-label]="alt()"
        >
          <span>{{ placeholder() }}</span>
        </div>
      }
      <figcaption>{{ caption() }}</figcaption>
    </figure>
  `,
})
export class Portrait {
  readonly src = input<string | null>(null);
  readonly alt = input.required<string>();
  readonly caption = input.required<string>();
  readonly placeholder = input.required<string>();
}
