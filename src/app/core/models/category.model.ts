export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CategoryPayload {
  name: string;
  color: string;
}

/** Palette offered when creating or editing a category. */
export const CATEGORY_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#0d9488',
  '#ca8a04',
  '#475569',
] as const;
