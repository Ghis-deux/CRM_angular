import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { Category } from '../../core/models/category.model';
import { ContactCard } from '../../shared/contact-card/contact-card';

@Component({
  selector: 'app-category-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ContactCard],
  template: `
    <section class="page">
      <a routerLink="/categories" class="back-link">← Back to categories</a>

      <div class="page-head">
        <div>
          <h1 class="category-title">
            <span class="color-dot color-dot-lg" [style.background]="category().color"></span>
            {{ category().name }}
          </h1>
          <p class="page-subtitle">
            {{ contactsInCategory().length }} contact(s) · created
            {{ category().createdAt | date: 'mediumDate' }}
          </p>
        </div>
        <div class="detail-actions">
          <a [routerLink]="['/categories', category().id, 'edit']" class="btn btn-secondary"
            >Edit</a
          >
          <a routerLink="/contacts/new" class="btn btn-primary">+ New contact</a>
        </div>
      </div>

      @if (contactsInCategory().length === 0) {
        <div class="empty-state">
          <p class="empty-title">No contact in this category yet.</p>
          <p class="empty-hint">Create a contact and assign it to "{{ category().name }}".</p>
          <a routerLink="/contacts/new" class="btn btn-primary">+ New contact</a>
        </div>
      } @else {
        <div class="card-grid">
          @for (contact of contactsInCategory(); track contact.id) {
            <app-contact-card [contact]="contact" />
          }
        </div>
      }
    </section>
  `,
})
export class CategoryDetail {
  readonly category = input.required<Category>();

  private readonly contactService = inject(ContactService);

  readonly contactsInCategory = computed(() =>
    this.contactService.contacts().filter((contact) => contact.categoryId === this.category().id),
  );
}
