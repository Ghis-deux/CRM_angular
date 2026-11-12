import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/services/confirm.service';

/** Modal overlay rendering the pending request of the ConfirmService. */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (confirmService.pending(); as request) {
      <div
        class="dialog-overlay"
        tabindex="-1"
        (click)="confirmService.answer(false)"
        (keydown.escape)="confirmService.answer(false)"
      >
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="request.title"
          (click)="$event.stopPropagation()"
          (keydown.escape)="confirmService.answer(false)"
        >
          <h2 class="dialog-title">{{ request.title }}</h2>
          <p class="dialog-message">{{ request.message }}</p>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" (click)="confirmService.answer(false)">
              {{ request.cancelLabel ?? 'Cancel' }}
            </button>
            <button
              type="button"
              class="btn"
              [class.btn-danger]="request.danger"
              [class.btn-primary]="!request.danger"
              (click)="confirmService.answer(true)"
            >
              {{ request.confirmLabel ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog {
  protected readonly confirmService = inject(ConfirmService);
}
