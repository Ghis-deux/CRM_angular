import { Injectable, inject, signal } from '@angular/core';
import { Category, CategoryPayload } from '../models/category.model';
import { SEED_CATEGORIES } from '../data/seed-data';
import { generateId } from '../utils/id.util';
import { STORAGE_KEYS, StorageService } from './storage.service';
import { ContactService } from './contact.service';

/** Thrown when trying to delete a category that still contains contacts. */
export class CategoryInUseError extends Error {
  constructor(public readonly contactCount: number) {
    super(`Cannot delete a category that still contains ${contactCount} contact(s).`);
    this.name = 'CategoryInUseError';
  }
}

/**
 * Signal-based state management for categories.
 * Seeds default categories on first launch so the app is usable out of the box.
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly storage = inject(StorageService);
  private readonly contactService = inject(ContactService);
  private readonly _categories = signal<Category[]>(this.loadInitial());

  readonly categories = this._categories.asReadonly();

  private loadInitial(): Category[] {
    const stored = this.storage.read<Category[]>(STORAGE_KEYS.categories);
    if (stored !== null) {
      return stored;
    }
    this.storage.write(STORAGE_KEYS.categories, SEED_CATEGORIES);
    return SEED_CATEGORIES;
  }

  getById(id: string): Category | undefined {
    return this._categories().find((category) => category.id === id);
  }

  contactCount(categoryId: string): number {
    return this.contactService.countByCategory(categoryId);
  }

  add(payload: CategoryPayload): Category {
    const category: Category = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    this.persist([...this._categories(), category]);
    return category;
  }

  update(id: string, payload: CategoryPayload): Category | undefined {
    const current = this.getById(id);
    if (!current) {
      return undefined;
    }
    const updated: Category = { ...current, ...payload };
    this.persist(this._categories().map((category) => (category.id === id ? updated : category)));
    return updated;
  }

  /** @throws CategoryInUseError when the category still contains contacts. */
  remove(id: string): boolean {
    const contactCount = this.contactCount(id);
    if (contactCount > 0) {
      throw new CategoryInUseError(contactCount);
    }
    const exists = this.getById(id) !== undefined;
    if (exists) {
      this.persist(this._categories().filter((category) => category.id !== id));
    }
    return exists;
  }

  private persist(categories: Category[]): void {
    const written = this.storage.write(STORAGE_KEYS.categories, categories);
    if (written) {
      this._categories.set(categories);
    }
  }
}
