export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  categoryId: string | null;
  favorite: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  categoryId: string | null;
  notes: string;
}

export type ContactSortOption = 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc';

export function fullName(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}
