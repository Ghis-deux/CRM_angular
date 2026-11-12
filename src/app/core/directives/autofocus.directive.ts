import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/** Focuses the host element as soon as it is rendered (used on form fields). */
@Directive({ selector: '[appAutofocus]' })
export class AutofocusDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    this.host.nativeElement.focus();
  }
}
