import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { CategoryService } from '../../core/services/category.service';
import { TimeAgoPipe } from '../../core/pipes/time-ago.pipe';
import { CategoryNamePipe } from '../../core/pipes/category-name.pipe';
import { Contact } from '../../core/models/contact.model';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TimeAgoPipe, CategoryNamePipe],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>Dashboard</h1>
          <p class="page-subtitle">Overview of your local contact base.</p>
        </div>
        <a routerLink="/contacts/new" class="btn btn-primary">+ New contact</a>
      </div>

      <div class="stats-grid">
        <a routerLink="/contacts" class="stat-card">
          <span class="stat-value">{{ totalContacts() }}</span>
          <span class="stat-label">Contacts</span>
        </a>
        <a routerLink="/favorites" class="stat-card">
          <span class="stat-value">{{ favoriteCount() }}</span>
          <span class="stat-label">Favorites</span>
        </a>
        <a routerLink="/categories" class="stat-card">
          <span class="stat-value">{{ categoryCount() }}</span>
          <span class="stat-label">Categories</span>
        </a>
        <div class="stat-card">
          <span class="stat-value">{{ uncategorizedCount() }}</span>
          <span class="stat-label">Uncategorized</span>
        </div>
      </div>

      <div class="dashboard-columns">
        <section class="panel" aria-label="Latest additions">
          <div class="panel-head">
            <h2>Latest additions</h2>
            <a routerLink="/contacts" class="muted-link">View all</a>
          </div>
          @if (recentContacts().length === 0) {
            <p class="empty-hint">No contacts yet. Create your first one!</p>
          } @else {
            <ul class="recent-list">
              @for (contact of recentContacts(); track contact.id) {
                <li>
                  <a [routerLink]="['/contacts', contact.id]" class="recent-item">
                    <span class="recent-name">
                      {{ contact.firstName }} {{ contact.lastName }}
                      @if (contact.favorite) {
                        <span class="star-inline" aria-hidden="true">★</span>
                      }
                    </span>
                    <span class="recent-meta">
                      {{ contact.categoryId | categoryName }} · added
                      {{ contact.createdAt | timeAgo }}
                    </span>
                  </a>
                </li>
              }
            </ul>
          }
        </section>

        <section class="panel" aria-label="Contacts per category">
          <div class="panel-head">
            <h2>Contacts per category</h2>
            <a routerLink="/categories" class="muted-link">Manage</a>
          </div>
          @if (categoryBreakdown().length === 0) {
            <p class="empty-hint">No categories yet.</p>
          } @else {
            <ul class="breakdown-list">
              @for (entry of categoryBreakdown(); track entry.id) {
                <li>
                  <a [routerLink]="['/categories', entry.id]" class="breakdown-item">
                    <span class="chip" [style.--chip]="entry.color">{{ entry.name }}</span>
                    <span class="breakdown-count">{{ entry.count }}</span>
                  </a>
                </li>
              }
            </ul>
          }
        </section>
      </div>
    </section>
  `,
})
export class Dashboard {
  private readonly contactService = inject(ContactService);
  private readonly categoryService = inject(CategoryService);

  readonly totalContacts = computed(() => this.contactService.contacts().length);
  readonly favoriteCount = computed(
    () => this.contactService.contacts().filter((contact) => contact.favorite).length,
  );
  readonly categoryCount = computed(() => this.categoryService.categories().length);
  readonly uncategorizedCount = computed(
    () => this.contactService.contacts().filter((contact) => contact.categoryId === null).length,
  );

  readonly recentContacts = computed<Contact[]>(() =>
    [...this.contactService.contacts()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
  );

  readonly categoryBreakdown = computed(() =>
    this.categoryService.categories().map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      count: this.contactService.countByCategory(category.id),
    })),
  );
}
