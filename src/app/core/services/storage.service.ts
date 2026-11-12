import { Injectable } from '@angular/core';

export const STORAGE_KEYS = {
  contacts: 'contact-crm.contacts',
  categories: 'contact-crm.categories',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Single entry point for localStorage access.
 * All serialization/deserialization and error handling is centralized here so
 * that feature services stay persistence-agnostic (easy swap for a backend later).
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  read<T>(key: StorageKey): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
      console.error(`[StorageService] Failed to read "${key}" from localStorage`, error);
      return null;
    }
  }

  write<T>(key: StorageKey, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageService] Failed to write "${key}" to localStorage`, error);
      return false;
    }
  }

  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Failed to remove "${key}" from localStorage`, error);
    }
  }
}
