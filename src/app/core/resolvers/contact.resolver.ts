import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Contact } from '../models/contact.model';
import { ContactService } from '../services/contact.service';

/**
 * Loads the contact for /contacts/:id routes and redirects to the list
 * with a clear error state when the id does not exist.
 */
export const contactResolver: ResolveFn<Contact> = (route) => {
  const id = route.paramMap.get('id');
  const contact = id !== null ? inject(ContactService).getById(id) : undefined;
  if (!contact) {
    const urlTree = inject(Router).createUrlTree(['/contacts'], {
      queryParams: { error: 'contact-not-found' },
    });
    return new RedirectCommand(urlTree);
  }
  return contact;
};
