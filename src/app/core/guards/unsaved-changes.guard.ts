import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmService } from '../services/confirm.service';

/** Components that can block navigation while holding unsaved changes. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Asks for confirmation before leaving a dirty form so the user never
 * loses input by accident (used on contact and category forms).
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }
  const confirmService = inject(ConfirmService);
  return confirmService.confirm({
    title: 'Unsaved changes',
    message: 'You have unsaved changes. Leave this page and discard them?',
    confirmLabel: 'Discard',
    cancelLabel: 'Stay',
    danger: true,
  });
};
