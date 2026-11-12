import { Pipe, PipeTransform, inject } from '@angular/core';
import { CategoryService } from '../services/category.service';

/** Resolves a category id into its display name, with a graceful fallback. */
@Pipe({ name: 'categoryName' })
export class CategoryNamePipe implements PipeTransform {
  private readonly categoryService = inject(CategoryService);

  transform(categoryId: string | null | undefined): string {
    if (!categoryId) {
      return 'Uncategorized';
    }
    return this.categoryService.getById(categoryId)?.name ?? 'Uncategorized';
  }
}
