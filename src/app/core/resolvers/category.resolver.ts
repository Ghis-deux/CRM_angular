import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Category } from '../models/category.model';
import { CategoryService } from '../services/category.service';

/**
 * Loads the category for /categories/:id routes and redirects to the list
 * with a clear error state when the id does not exist.
 */
export const categoryResolver: ResolveFn<Category> = (route) => {
  const id = route.paramMap.get('id');
  const category = id !== null ? inject(CategoryService).getById(id) : undefined;
  if (!category) {
    const urlTree = inject(Router).createUrlTree(['/categories'], {
      queryParams: { error: 'category-not-found' },
    });
    return new RedirectCommand(urlTree);
  }
  return category;
};
