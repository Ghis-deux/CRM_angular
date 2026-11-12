import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <div class="container footer-inner">
        <p>Contact CRM — a local-first mini CRM built with Angular.</p>
        <p>Data is stored in your browser (localStorage), nothing leaves your machine.</p>
      </div>
    </footer>
  `,
})
export class Footer {}
