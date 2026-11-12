import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Strict email format: local@domain.tld (tld of at least 2 letters). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Phone: optional leading +, then 6 to 20 digits/spaces/dashes/parens/dots. */
const PHONE_PATTERN = /^\+?[\d\s().-]{6,20}$/;

/** Reusable custom validators for Reactive Forms. */
export class CustomValidators {
  /** Stricter than the built-in Validators.email (requires a real TLD). */
  static emailFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (typeof value !== 'string' || value.trim() === '') {
        return null;
      }
      return EMAIL_PATTERN.test(value.trim()) ? null : { emailFormat: true };
    };
  }

  /** Accepts common phone notations, rejects letters and too-short values. */
  static phoneFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (typeof value !== 'string' || value.trim() === '') {
        return null;
      }
      const digitCount = value.replace(/\D/g, '').length;
      if (digitCount < 6 || digitCount > 15) {
        return { phoneFormat: true };
      }
      return PHONE_PATTERN.test(value.trim()) ? null : { phoneFormat: true };
    };
  }

  /** Required + rejects values made only of whitespace. */
  static notBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (typeof value !== 'string' || value.trim() === '') {
        return { notBlank: true };
      }
      return null;
    };
  }
}
