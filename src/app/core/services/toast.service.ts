import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/** Lightweight toast notifications, rendered by the ToastContainer component. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private static nextId = 0;

  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', durationMs = 3500): void {
    const toast: Toast = { id: ++ToastService.nextId, type, message };
    this._toasts.update((toasts) => [...toasts, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 5000);
  }

  dismiss(id: number): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
