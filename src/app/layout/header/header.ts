import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand">
          <span class="brand-mark" aria-hidden="true">CC</span>
          <span class="brand-name">Contact CRM</span>
        </a>

        <nav class="main-nav" aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            >Dashboard</a
          >
          <a routerLink="/contacts" routerLinkActive="active">Contacts</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
          <a routerLink="/favorites" routerLinkActive="active" class="nav-favorites">
            Favorites
            @if (favoriteCount() > 0) {
              <span class="nav-badge">{{ favoriteCount() }}</span>
            }
          </a>
        </nav>
      </div>
    </header>
  `,
})
export class Header {
  private readonly contactService = inject(ContactService);

  readonly favoriteCount = computed(
    () => this.contactService.contacts().filter((contact) => contact.favorite).length,
  );
}
