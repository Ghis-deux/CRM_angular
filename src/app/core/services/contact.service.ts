import { Injectable, inject, signal } from '@angular/core';
import { Contact, ContactPayload } from '../models/contact.model';
import { SEED_CONTACTS } from '../data/seed-data';
import { generateId } from '../utils/id.util';
import { STORAGE_KEYS, StorageService } from './storage.service';

/**
 * Signal-based state management for contacts.
 * Reads from localStorage once at startup, then keeps an in-memory signal in
 * sync with every mutation (write-through persistence).
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly storage = inject(StorageService);
  private readonly _contacts = signal<Contact[]>(this.loadInitial());

  readonly contacts = this._contacts.asReadonly();

  private loadInitial(): Contact[] {
    const stored = this.storage.read<Contact[]>(STORAGE_KEYS.contacts);
    if (stored !== null) {
      return stored;
    }
    this.storage.write(STORAGE_KEYS.contacts, SEED_CONTACTS);
    return SEED_CONTACTS;
  }

  getById(id: string): Contact | undefined {
    return this._contacts().find((contact) => contact.id === id);
  }

  add(payload: ContactPayload): Contact {
    const now = new Date().toISOString();
    const contact: Contact = {
      id: generateId(),
      favorite: false,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    this.persist([contact, ...this._contacts()]);
    return contact;
  }

  update(id: string, payload: ContactPayload): Contact | undefined {
    const current = this.getById(id);
    if (!current) {
      return undefined;
    }
    const updated: Contact = { ...current, ...payload, updatedAt: new Date().toISOString() };
    this.persist(this._contacts().map((contact) => (contact.id === id ? updated : contact)));
    return updated;
  }

  remove(id: string): boolean {
    const exists = this.getById(id) !== undefined;
    if (exists) {
      this.persist(this._contacts().filter((contact) => contact.id !== id));
    }
    return exists;
  }

  toggleFavorite(id: string): void {
    this.persist(
      this._contacts().map((contact) =>
        contact.id === id ? { ...contact, favorite: !contact.favorite } : contact,
      ),
    );
  }

  countByCategory(categoryId: string): number {
    return this._contacts().filter((contact) => contact.categoryId === categoryId).length;
  }

  private persist(contacts: Contact[]): void {
    const written = this.storage.write(STORAGE_KEYS.contacts, contacts);
    if (written) {
      this._contacts.set(contacts);
    }
  }
}
