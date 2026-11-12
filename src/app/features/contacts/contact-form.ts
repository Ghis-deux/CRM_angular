import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomValidators } from '../../core/validators/custom-validators';
import { AutofocusDirective } from '../../core/directives/autofocus.directive';
import { Contact, ContactPayload, fullName } from '../../core/models/contact.model';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';

interface ContactFormControls {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  company: FormControl<string>;
  jobTitle: FormControl<string>;
  categoryId: FormControl<string | null>;
  notes: FormControl<string>;
}

/** Shared by /contacts/new (creation) and /contacts/:id/edit (edition). */
@Component({
  selector: 'app-contact-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AutofocusDirective],
  template: `
    <section class="page page-narrow">
      <a [routerLink]="backLink()" class="back-link">← Back</a>

      <div class="form-card">
        <h1>{{ isEditMode() ? 'Edit contact' : 'New contact' }}</h1>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="form-row">
            <div class="form-field">
              <label for="firstName">First name *</label>
              <input id="firstName" type="text" formControlName="firstName" appAutofocus />
              @if (showError('firstName')) {
                <p class="field-error">{{ errorFor('firstName') }}</p>
              }
            </div>

            <div class="form-field">
              <label for="lastName">Last name *</label>
              <input id="lastName" type="text" formControlName="lastName" />
              @if (showError('lastName')) {
                <p class="field-error">{{ errorFor('lastName') }}</p>
              }
            </div>
          </div>

          <div class="form-field">
            <label for="email">Email *</label>
            <input id="email" type="email" formControlName="email" placeholder="name@example.com" />
            @if (showError('email')) {
              <p class="field-error">{{ errorFor('email') }}</p>
            }
          </div>

          <div class="form-field">
            <label for="phone">Phone *</label>
            <input id="phone" type="tel" formControlName="phone" placeholder="+33 6 12 34 56 78" />
            @if (showError('phone')) {
              <p class="field-error">{{ errorFor('phone') }}</p>
            }
          </div>

          <div class="form-row">
            <div class="form-field">
              <label for="company">Company</label>
              <input id="company" type="text" formControlName="company" />
            </div>

            <div class="form-field">
              <label for="jobTitle">Job title</label>
              <input id="jobTitle" type="text" formControlName="jobTitle" />
            </div>
          </div>

          <div class="form-field">
            <label for="categoryId">Category</label>
            <select id="categoryId" formControlName="categoryId">
              <option [ngValue]="null">No category</option>
              @for (category of categories(); track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>
          </div>

          <div class="form-field">
            <label for="notes">Notes</label>
            <textarea id="notes" rows="4" formControlName="notes"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditMode() ? 'Save changes' : 'Create contact' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class ContactForm implements HasUnsavedChanges, OnInit {
  /** Bound by the router (withComponentInputBinding) on /contacts/:id/edit. */
  readonly contact = input<Contact>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly categories = this.categoryService.categories;

  readonly form = this.formBuilder.group<ContactFormControls>({
    firstName: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, CustomValidators.notBlank()],
    }),
    lastName: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, CustomValidators.notBlank()],
    }),
    email: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, CustomValidators.emailFormat()],
    }),
    phone: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, CustomValidators.phoneFormat()],
    }),
    company: this.formBuilder.nonNullable.control(''),
    jobTitle: this.formBuilder.nonNullable.control(''),
    categoryId: this.formBuilder.control<string | null>(null),
    notes: this.formBuilder.nonNullable.control(''),
  });

  readonly isEditMode = computed(() => this.contact() !== undefined);
  readonly backLink = computed(() =>
    this.isEditMode() ? ['/contacts', this.contact()!.id] : ['/contacts'],
  );

  ngOnInit(): void {
    const existing = this.contact();
    if (existing) {
      this.form.patchValue(
        {
          firstName: existing.firstName,
          lastName: existing.lastName,
          email: existing.email,
          phone: existing.phone,
          company: existing.company,
          jobTitle: existing.jobTitle,
          categoryId: existing.categoryId,
          notes: existing.notes,
        },
        { emitEvent: false },
      );
    }
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  protected showError(controlName: keyof ContactFormControls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected errorFor(controlName: keyof ContactFormControls): string {
    const errors: ValidationErrors | null = this.form.controls[controlName].errors;
    if (!errors) {
      return '';
    }
    if (errors['required'] || errors['notBlank']) {
      return 'This field is required.';
    }
    if (errors['emailFormat']) {
      return 'Please enter a valid email address (e.g. name@example.com).';
    }
    if (errors['phoneFormat']) {
      return 'Please enter a valid phone number (6–15 digits, +, spaces, dashes allowed).';
    }
    return 'Invalid value.';
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.error('Please fix the highlighted fields before submitting.');
      return;
    }

    const payload: ContactPayload = {
      firstName: this.form.getRawValue().firstName.trim(),
      lastName: this.form.getRawValue().lastName.trim(),
      email: this.form.getRawValue().email.trim(),
      phone: this.form.getRawValue().phone.trim(),
      company: this.form.getRawValue().company.trim(),
      jobTitle: this.form.getRawValue().jobTitle.trim(),
      categoryId: this.form.getRawValue().categoryId,
      notes: this.form.getRawValue().notes.trim(),
    };

    const existing = this.contact();
    if (existing) {
      const updated = this.contactService.update(existing.id, payload);
      if (updated) {
        this.form.markAsPristine();
        this.toastService.success(`"${fullName(updated)}" has been updated.`);
        void this.router.navigate(['/contacts', updated.id]);
      } else {
        this.toastService.error('The contact no longer exists.');
      }
    } else {
      const created = this.contactService.add(payload);
      this.form.markAsPristine();
      this.toastService.success(`"${fullName(created)}" has been created.`);
      void this.router.navigate(['/contacts', created.id]);
    }
  }

  protected async cancel(): Promise<void> {
    void this.router.navigate(this.backLink());
  }
}
