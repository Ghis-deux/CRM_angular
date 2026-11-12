import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  id: number;
}

/**
 * Promise-based confirmation dialog: any component can `await confirm(...)`.
 * The ConfirmDialog component renders the pending request and calls `answer`.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private static nextId = 0;
  private resolver: ((confirmed: boolean) => void) | null = null;

  private readonly _pending = signal<PendingConfirm | null>(null);
  readonly pending = this._pending.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.resolver?.(false);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      this._pending.set({ ...options, id: ++ConfirmService.nextId });
    });
  }

  answer(confirmed: boolean): void {
    this.resolver?.(confirmed);
    this.resolver = null;
    this._pending.set(null);
  }
}
