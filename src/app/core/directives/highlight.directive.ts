import { Directive, ElementRef, OnChanges, OnDestroy, inject, input } from '@angular/core';

/**
 * Highlights every occurrence of the bound search term inside the host
 * element by wrapping matches in <mark>. Safe: only DOM APIs are used,
 * the term is never injected as HTML.
 */
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective implements OnChanges, OnDestroy {
  readonly appHighlight = input<string>('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private originalText: string | null = null;

  constructor() {
    queueMicrotask(() => this.applyHighlight());
  }

  ngOnChanges(): void {
    this.applyHighlight();
  }

  ngOnDestroy(): void {
    this.restoreOriginal();
  }

  private applyHighlight(): void {
    const element = this.host.nativeElement;
    if (this.originalText === null) {
      this.originalText = element.textContent ?? '';
    }
    const term = this.appHighlight().trim();
    element.textContent = '';
    if (term === '') {
      element.textContent = this.originalText;
      return;
    }

    const haystack = this.originalText;
    const lowerHaystack = haystack.toLowerCase();
    const lowerTerm = term.toLowerCase();
    let cursor = 0;
    let matchIndex = lowerHaystack.indexOf(lowerTerm, cursor);
    while (matchIndex !== -1) {
      if (matchIndex > cursor) {
        element.append(haystack.slice(cursor, matchIndex));
      }
      const mark = document.createElement('mark');
      mark.textContent = haystack.slice(matchIndex, matchIndex + term.length);
      element.append(mark);
      cursor = matchIndex + term.length;
      matchIndex = lowerHaystack.indexOf(lowerTerm, cursor);
    }
    element.append(haystack.slice(cursor));
  }

  private restoreOriginal(): void {
    if (this.originalText !== null) {
      this.host.nativeElement.textContent = this.originalText;
    }
  }
}
