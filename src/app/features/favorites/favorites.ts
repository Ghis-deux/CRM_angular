import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { ContactCard } from '../../shared/contact-card/contact-card';
import { Contact, fullName } from '../../core/models/contact.model';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-favorites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ContactCard],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>Favorites</h1>
          <p class="page-subtitle">{{ favorites().length }} favorite contact(s)</p>
        </div>
      </div>

      @if (favorites().length === 0) {
        <div class="empty-state">
          <p class="empty-title">No favorite contact yet.</p>
          <p class="empty-hint">Use the star on a contact card to pin it here.</p>
          <a routerLink="/contacts" class="btn btn-primary">Browse contacts</a>
        </div>
      } @else {
        <div class="card-grid">
          @for (contact of favorites(); track contact.id) {
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
export class Favorites {
  private readonly contactService = inject(ContactService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);

  readonly favorites = computed<Contact[]>(() =>
    this.contactService
      .contacts()
      .filter((contact) => contact.favorite)
      .sort((a, b) => fullName(a).localeCompare(fullName(b))),
  );

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
