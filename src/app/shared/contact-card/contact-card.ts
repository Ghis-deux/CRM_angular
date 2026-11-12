import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Contact, fullName } from '../../core/models/contact.model';
import { CategoryService } from '../../core/services/category.service';
import { CategoryNamePipe } from '../../core/pipes/category-name.pipe';
import { InitialsPipe } from '../../core/pipes/initials.pipe';

/** Reusable contact card used by the contacts list, favorites and dashboard. */
@Component({
  selector: 'app-contact-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategoryNamePipe, InitialsPipe],
  template: `
    <article class="contact-card">
      <div class="contact-card-top">
        <span class="avatar" [style.--chip]="categoryColor()" aria-hidden="true">
          {{ fullName(contact()) | initials }}
        </span>
        <button
          type="button"
          class="star-btn"
          [class.active]="contact().favorite"
          (click)="favoriteToggled.emit(contact().id)"
          [attr.aria-pressed]="contact().favorite"
          [attr.aria-label]="contact().favorite ? 'Remove from favorites' : 'Add to favorites'"
        >
          {{ contact().favorite ? '★' : '☆' }}
        </button>
      </div>

      <h3 class="contact-card-name">
        <a [routerLink]="['/contacts', contact().id]">{{ fullName(contact()) }}</a>
      </h3>

      @if (contact().jobTitle || contact().company) {
        <p class="contact-card-role">
          {{ contact().jobTitle }}
          @if (contact().jobTitle && contact().company) {
            <span> · </span>
          }
          {{ contact().company }}
        </p>
      }

      <p class="contact-card-line">
        <span aria-hidden="true">✉</span>
        <a class="muted-link" [href]="'mailto:' + contact().email">{{ contact().email }}</a>
      </p>
      <p class="contact-card-line">
        <span aria-hidden="true">☎</span>
        <span>{{ contact().phone }}</span>
      </p>

      <div class="contact-card-footer">
        <span class="chip" [style.--chip]="categoryColor()">
          {{ contact().categoryId | categoryName }}
        </span>
        <button
          type="button"
          class="btn btn-ghost btn-danger-text"
          (click)="deleted.emit(contact().id)"
        >
          Delete
        </button>
      </div>
    </article>
  `,
})
export class ContactCard {
  readonly contact = input.required<Contact>();
  readonly favoriteToggled = output<string>();
  readonly deleted = output<string>();

  private readonly categoryService = inject(CategoryService);

  readonly categoryColor = computed(
    () => this.categoryService.getById(this.contact().categoryId ?? '')?.color ?? '#94a3b8',
  );

  protected readonly fullName = fullName;
}
