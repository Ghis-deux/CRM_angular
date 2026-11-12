import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { contactResolver } from './core/resolvers/contact.resolver';
import { categoryResolver } from './core/resolvers/category.resolver';

/**
 * Lazy-loaded feature routes. Resolvers guarantee that :id routes always
 * receive an existing entity, and the unsaved-changes guard protects forms.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Dashboard | Contact CRM',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'contacts',
    children: [
      {
        path: '',
        title: 'Contacts | Contact CRM',
        loadComponent: () =>
          import('./features/contacts/contacts-list').then((m) => m.ContactsList),
      },
      {
        path: 'new',
        title: 'New contact | Contact CRM',
        loadComponent: () => import('./features/contacts/contact-form').then((m) => m.ContactForm),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: ':id',
        title: 'Contact | Contact CRM',
        loadComponent: () =>
          import('./features/contacts/contact-detail').then((m) => m.ContactDetail),
        resolve: { contact: contactResolver },
      },
      {
        path: ':id/edit',
        title: 'Edit contact | Contact CRM',
        loadComponent: () => import('./features/contacts/contact-form').then((m) => m.ContactForm),
        resolve: { contact: contactResolver },
        canDeactivate: [unsavedChangesGuard],
      },
    ],
  },
  {
    path: 'categories',
    children: [
      {
        path: '',
        title: 'Categories | Contact CRM',
        loadComponent: () =>
          import('./features/categories/categories-list').then((m) => m.CategoriesList),
      },
      {
        path: 'new',
        title: 'New category | Contact CRM',
        loadComponent: () =>
          import('./features/categories/category-form').then((m) => m.CategoryForm),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: ':id',
        title: 'Category | Contact CRM',
        loadComponent: () =>
          import('./features/categories/category-detail').then((m) => m.CategoryDetail),
        resolve: { category: categoryResolver },
      },
      {
        path: ':id/edit',
        title: 'Edit category | Contact CRM',
        loadComponent: () =>
          import('./features/categories/category-form').then((m) => m.CategoryForm),
        resolve: { category: categoryResolver },
        canDeactivate: [unsavedChangesGuard],
      },
    ],
  },
  {
    path: 'favorites',
    title: 'Favorites | Contact CRM',
    loadComponent: () => import('./features/favorites/favorites').then((m) => m.Favorites),
  },
  { path: '**', redirectTo: '' },
];
