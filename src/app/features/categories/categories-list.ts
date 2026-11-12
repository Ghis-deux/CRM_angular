import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CategoryService, CategoryInUseError } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-categories-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>Categories</h1>
          <p class="page-subtitle">{{ categories().length }} categorie(s)</p>
        </div>
        <a routerLink="/categories/new" class="btn btn-primary">+ New category</a>
      </div>

      @if (notFoundError()) {
        <p class="alert alert-error">The requested category does not exist.</p>
      }

      @if (categories().length === 0) {
        <div class="empty-state">
          <p class="empty-title">No category yet.</p>
          <p class="empty-hint">Create your first category to organize your contacts.</p>
          <a routerLink="/categories/new" class="btn btn-primary">+ New category</a>
        </div>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Contacts</th>
                <th scope="col">Created</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (category of rows(); track category.id) {
                <tr>
                  <td>
                    <a [routerLink]="['/categories', category.id]" class="category-link">
                      <span class="color-dot" [style.background]="category.color"></span>
                      {{ category.name }}
                    </a>
                  </td>
                  <td>{{ category.count }}</td>
                  <td>{{ category.createdAt | date: 'mediumDate' }}</td>
                  <td class="table-actions">
                    <a [routerLink]="['/categories', category.id, 'edit']" class="btn btn-ghost"
                      >Edit</a
                    >
                    <button
                      type="button"
                      class="btn btn-ghost btn-danger-text"
                      (click)="deleteCategory(category.id)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="table-hint">A category cannot be deleted while it still contains contacts.</p>
      }
    </section>
  `,
})
export class CategoriesList {
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  private readonly route = inject(ActivatedRoute);

  readonly categories = this.categoryService.categories;
  readonly notFoundError = signal(
    this.route.snapshot.queryParamMap.get('error') === 'category-not-found',
  );

  readonly rows = computed(() =>
    this.categories().map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      createdAt: category.createdAt,
      count: this.categoryService.contactCount(category.id),
    })),
  );

  protected async deleteCategory(id: string): Promise<void> {
    const category = this.categoryService.getById(id);
    if (!category) {
      return;
    }
    const contactCount = this.categoryService.contactCount(id);
    if (contactCount > 0) {
      this.toastService.error(
        `"${category.name}" cannot be deleted: it still contains ${contactCount} contact(s). Remove or reassign them first.`,
      );
      return;
    }
    const confirmed = await this.confirmService.confirm({
      title: 'Delete category',
      message: `Delete the category "${category.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      const deleted = this.categoryService.remove(id);
      if (deleted) {
        this.toastService.success(`Category "${category.name}" has been deleted.`);
      }
    } catch (error) {
      if (error instanceof CategoryInUseError) {
        this.toastService.error(
          `"${category.name}" cannot be deleted: it still contains ${error.contactCount} contact(s).`,
        );
      } else {
        this.toastService.error('An unexpected error occurred while deleting the category.');
      }
    }
  }
}
