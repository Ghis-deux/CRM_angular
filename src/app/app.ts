import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';
import { ToastContainer } from './shared/toast-container/toast-container';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer, ConfirmDialog, ToastContainer],
  template: `
    <app-header />
    <main class="app-main">
      <div class="container">
        <router-outlet />
      </div>
    </main>
    <app-footer />
    <app-confirm-dialog />
    <app-toast-container />
  `,
})
export class App {}
