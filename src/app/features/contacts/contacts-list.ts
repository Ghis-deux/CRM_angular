import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContactCard } from '../../shared/contact-card/contact-card';
import { ContactService } from '../../core/services/contact.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Contact, ContactSortOption, fullName } from '../../core/models/contact.model';

const SORT_LABELS: Record<ContactSortOption, string> = {
  'name-asc': 'Name (A–Z)',
  'name-desc': 'Name (Z–A)',
  'date-desc': 'Date (newest first)',
  'date-asc': 'Date (oldest first)',
};

@Component({
  selector: 'app-contacts-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ContactCard],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>Contacts</h1>
          <p class="page-subtitle">
            {{ filteredContacts().length }} of {{ allContacts().length }} contact(s)
          </p>
        </div>
        <a routerLink="/contacts/new" class="btn btn-primary">+ New contact</a>
      </div>

      @if (notFoundError()) {
        <p class="alert alert-error">The requested contact does not exist.</p>
      }

      <div class="filter-bar" role="search">
        <div class="filter-field grow">
          <label for="contact-search">Search by name</label>
          <input
            id="contact-search"
            #searchInput
            type="search"
            placeholder="e.g. Marie"
            [value]="searchTerm()"
            (input)="searchTerm.set(searchInput.value)"
          />
        </div>

        <div class="filter-field">
          <label for="contact-category">Category</label>
          <select
            id="contact-category"
            [value]="categoryFilter()"
            (change)="onCategoryChange($event)"
          >
            <option value="all">All categories</option>
            @for (category of categories(); track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
            }
          </select>
        </div>

        <div class="filter-field">
          <label for="contact-sort">Sort by</label>
          <select id="contact-sort" [value]="sortBy()" (change)="onSortChange($event)">
            @for (option of sortOptions; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </div>

        <label class="checkbox-field" for="favorites-only">
          <input
            id="favorites-only"
            type="checkbox"
            [checked]="favoritesOnly()"
            (change)="favoritesOnly.set(!favoritesOnly())"
          />
          <span>Favorites only</span>
        </label>

        @if (hasActiveFilters()) {
          <button type="button" class="btn btn-ghost" (click)="resetFilters()">Reset</button>
        }
      </div>

      @if (filteredContacts().length === 0) {
        <div class="empty-state">
          <p class="empty-title">No contact matches your filters.</p>
          <p class="empty-hint">Try another search term, or create a new contact.</p>
          <a routerLink="/contacts/new" class="btn btn-primary">+ New contact</a>
        </div>
      } @else {
        <div class="card-grid">
          @for (contact of filteredContacts(); track contact.id) {
            <app-contact-card
              [contact]="contact"
              (favoriteToggled)="toggleFavorite($event)"
              (deleted)="deleteContact($event)"
            />
          }
        </div>
      }
    </section>
  `,
})
export class ContactsList {
  private readonly contactService = inject(ContactService);
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  private readonly route = inject(ActivatedRoute);

  readonly allContacts = this.contactService.contacts;
  readonly categories = this.categoryService.categories;
  readonly sortOptions = (Object.keys(SORT_LABELS) as ContactSortOption[]).map((value) => ({
    value,
    label: SORT_LABELS[value],
  }));

  readonly searchTerm = signal('');
  readonly categoryFilter = signal('all');
  readonly favoritesOnly = signal(false);
  readonly sortBy = signal<ContactSortOption>('name-asc');
  readonly notFoundError = signal(
    this.route.snapshot.queryParamMap.get('error') === 'contact-not-found',
  );

  readonly hasActiveFilters = computed(
    () =>
      this.searchTerm().trim() !== '' || this.categoryFilter() !== 'all' || this.favoritesOnly(),
  );

  readonly filteredContacts = computed<Contact[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.categoryFilter();
    const favoritesOnly = this.favoritesOnly();
    const sort = this.sortBy();

    const filtered = this.contactService.contacts().filter((contact) => {
      const matchesTerm = term === '' || fullName(contact).toLowerCase().includes(term);
      const matchesCategory = category === 'all' || contact.categoryId === category;
      const matchesFavorite = !favoritesOnly || contact.favorite;
      return matchesTerm && matchesCategory && matchesFavorite;
    });

    const comparators: Record<ContactSortOption, (a: Contact, b: Contact) => number> = {
      'name-asc': (a, b) => fullName(a).localeCompare(fullName(b)),
      'name-desc': (a, b) => fullName(b).localeCompare(fullName(a)),
      'date-desc': (a, b) => b.createdAt.localeCompare(a.createdAt),
      'date-asc': (a, b) => a.createdAt.localeCompare(b.createdAt),
    };
    return filtered.sort(comparators[sort]);
  });

  protected onCategoryChange(event: Event): void {
    this.categoryFilter.set((event.target as HTMLSelectElement).value);
  }

  protected onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as ContactSortOption);
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.categoryFilter.set('all');
    this.favoritesOnly.set(false);
    this.sortBy.set('name-asc');
  }

  protected toggleFavorite(id: string): void {
    this.contactService.toggleFavorite(id);
  }

  protected async deleteContact(id: string): Promise<void> {
    const contact = this.contactService.getById(id);
    if (!contact) {
      return;
    }
    const confirmed = await this.confirmService.confirm({
      title: 'Delete contact',
      message: `Delete "${fullName(contact)}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    const deleted = this.contactService.remove(id);
    if (deleted) {
      this.toastService.success(`"${fullName(contact)}" has been deleted.`);
    } else {
      this.toastService.error('The contact could not be deleted.');
    }
  }
}
