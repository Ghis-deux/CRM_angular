import { Pipe, PipeTransform } from '@angular/core';

/** Converts an ISO date into a human-friendly relative label ("3 days ago"). */
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    const elapsedMs = Date.now() - date.getTime();
    if (Number.isNaN(elapsedMs) || elapsedMs < 0) {
      return new Date(value).toLocaleDateString();
    }

    const minutes = Math.floor(elapsedMs / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 31) return `${days} day${days > 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}
