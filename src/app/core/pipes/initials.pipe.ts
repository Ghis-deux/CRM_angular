import { Pipe, PipeTransform } from '@angular/core';

/** Returns up to two uppercase initials from a full name, e.g. "Marie Dubois" -> "MD". */
@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || value.trim() === '') {
      return '?';
    }
    const words = value.trim().split(/\s+/).slice(0, 2);
    const initials = words.map((word) => word.charAt(0).toUpperCase()).join('');
    return initials === '' ? '?' : initials;
  }
}
