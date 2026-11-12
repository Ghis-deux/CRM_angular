import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomValidators } from '../../core/validators/custom-validators';
import { AutofocusDirective } from '../../core/directives/autofocus.directive';
import { CATEGORY_COLORS, Category, CategoryPayload } from '../../core/models/category.model';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';

/** Shared by /categories/new (creation) and /categories/:id/edit (edition). */
@Component({
  selector: 'app-category-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AutofocusDirective],
  template: `
    <section class="page page-narrow">
      <a [routerLink]="backLink()" class="back-link">← Back</a>

      <div class="form-card">
        <h1>{{ isEditMode() ? 'Edit category' : 'New category' }}</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-field">
            <label for="name">Name *</label>
            <input id="name" type="text" formControlName="name" appAutofocus />
            @if (showError()) {
              <p class="field-error">{{ errorFor() }}</p>
            }
          </div>

          <fieldset class="form-field color-picker">
            <legend>Color *</legend>
            <div class="color-options" role="radiogroup" aria-label="Category color">
              @for (color of palette; track color) {
                <label class="color-option">
                  <input
                    type="radio"
                    name="color"
                    [value]="color"
                    formControlName="color"
                    [attr.aria-label]="color"
                  />
                  <span class="color-swatch" [style.background]="color"></span>
                </label>
              }
            </div>
            @if (showError()) {
              <p class="field-error">{{ errorFor() }}</p>
            }
          </fieldset>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditMode() ? 'Save changes' : 'Create category' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class CategoryForm implements HasUnsavedChanges, OnInit {
  /** Bound by the router (withComponentInputBinding) on /categories/:id/edit. */
  readonly category = input<Category>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly palette = CATEGORY_COLORS;

  readonly nameControl = this.formBuilder.nonNullable.control('', {
    validators: [Validators.required, CustomValidators.notBlank()],
  });

  readonly colorControl = this.formBuilder.nonNullable.control<string>(CATEGORY_COLORS[0], {
    validators: [Validators.required],
  });

  readonly form = this.formBuilder.group({
    name: this.nameControl,
    color: this.colorControl,
  });

  readonly isEditMode = computed(() => this.category() !== undefined);
  readonly backLink = computed(() =>
    this.isEditMode() ? ['/categories', this.category()!.id] : ['/categories'],
  );

  ngOnInit(): void {
    const existing = this.category();
    if (existing) {
      this.form.patchValue({ name: existing.name, color: existing.color }, { emitEvent: false });
    }
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  protected showError(): boolean {
    const name = this.form.controls.name;
    return name.invalid && (name.touched || name.dirty);
  }

  protected errorFor(): string {
    const errors = this.nameControl.errors;
    if (!errors) {
      return '';
    }
    if (errors['duplicate']) {
      return 'A category with this name already exists.';
    }
    return 'This field is required.';
  }

  protected onSubmit(): void {
    const nameControl = this.nameControl;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.error('Please fix the highlighted fields before submitting.');
      return;
    }

    const trimmedName = nameControl.value.trim();
    const duplicate = this.categoryService
      .categories()
      .some(
        (category) =>
          category.name.toLowerCase() === trimmedName.toLowerCase() &&
          category.id !== this.category()?.id,
      );
    if (duplicate) {
      // Uniqueness depends on live data, so it is checked at submit time.
      nameControl.setErrors({ ...nameControl.errors, duplicate: true });
      this.toastService.error('A category with this name already exists.');
      return;
    }

    const payload: CategoryPayload = { name: trimmedName, color: this.form.controls.color.value };

    const existing = this.category();
    if (existing) {
      const updated = this.categoryService.update(existing.id, payload);
      if (updated) {
        this.form.markAsPristine();
        this.toastService.success(`Category "${updated.name}" has been updated.`);
        void this.router.navigate(['/categories']);
      } else {
        this.toastService.error('The category no longer exists.');
      }
    } else {
      const created = this.categoryService.add(payload);
      this.form.markAsPristine();
      this.toastService.success(`Category "${created.name}" has been created.`);
      void this.router.navigate(['/categories', created.id]);
    }
  }

  protected async cancel(): Promise<void> {
    void this.router.navigate(this.backLink());
  }
}
