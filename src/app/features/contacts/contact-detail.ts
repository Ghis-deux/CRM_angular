import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Contact, fullName } from '../../core/models/contact.model';
import { CategoryNamePipe } from '../../core/pipes/category-name.pipe';
import { InitialsPipe } from '../../core/pipes/initials.pipe';

@Component({
  selector: 'app-contact-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, CategoryNamePipe, InitialsPipe],
  template: `
    <section class="page">
      <a routerLink="/contacts" class="back-link">← Back to contacts</a>

      <div class="detail-card">
        <div class="detail-head">
          <div class="detail-identity">
            <span class="avatar avatar-lg" [style.--chip]="categoryColor()" aria-hidden="true">
              {{ fullName(contact()) | initials }}
            </span>
            <div>
              <h1>{{ fullName(contact()) }}</h1>
              <p class="page-subtitle">
                {{ contact().jobTitle }}
                @if (contact().jobTitle && contact().company) {
                  <span> at </span>
                }
                {{ contact().company }}
              </p>
            </div>
          </div>
          <div class="detail-actions">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="toggleFavorite()"
              [attr.aria-pressed]="contact().favorite"
            >
              {{ contact().favorite ? '★ Favorited' : '☆ Add to favorites' }}
            </button>
            <a [routerLink]="['/contacts', contact().id, 'edit']" class="btn btn-primary">Edit</a>
            <button type="button" class="btn btn-danger" (click)="deleteContact()">Delete</button>
          </div>
        </div>

        <dl class="detail-grid">
          <div>
            <dt>Email</dt>
            <dd>
              <a [href]="'mailto:' + contact().email">{{ contact().email }}</a>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{{ contact().phone }}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>
              <span class="chip" [style.--chip]="categoryColor()">
                {{ contact().categoryId | categoryName }}
              </span>
            </dd>
          </div>
          <div>
            <dt>Company</dt>
            <dd>{{ contact().company || '—' }}</dd>
          </div>
          <div>
            <dt>Job title</dt>
            <dd>{{ contact().jobTitle || '—' }}</dd>
          </div>
          <div>
            <dt>Created / Updated</dt>
            <dd>
              {{ contact().createdAt | date: 'mediumDate' }} ·
              {{ contact().updatedAt | date: 'mediumDate' }}
            </dd>
          </div>
        </dl>

        <div class="detail-notes">
          <h2>Notes</h2>
          <p>{{ contact().notes || 'No notes for this contact.' }}</p>
        </div>
      </div>
    </section>
  `,
})
export class ContactDetail {
  readonly contact = input.required<Contact>();

  private readonly contactService = inject(ContactService);
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  private readonly router = inject(Router);

  readonly categoryColor = computed(
    () => this.categoryService.getById(this.contact().categoryId ?? '')?.color ?? '#94a3b8',
  );

  protected readonly fullName = fullName;

  protected toggleFavorite(): void {
    this.contactService.toggleFavorite(this.contact().id);
  }

  protected async deleteContact(): Promise<void> {
    const current = this.contact();
    const confirmed = await this.confirmService.confirm({
      title: 'Delete contact',
      message: `Delete "${fullName(current)}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    const deleted = this.contactService.remove(current.id);
    if (deleted) {
      this.toastService.success(`"${fullName(current)}" has been deleted.`);
      void this.router.navigate(['/contacts']);
    } else {
      this.toastService.error('The contact could not be deleted.');
    }
  }
}
