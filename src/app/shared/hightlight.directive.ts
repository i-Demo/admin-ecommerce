import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
    selector: '[appHighlight]',
    standalone: true
})
export class HighlightDirective implements OnChanges {
    @Input('appHighlight') color = 'yellow';
    constructor(private el: ElementRef) { }
    ngOnChanges() { this.el.nativeElement.style.backgroundColor = this.color; }
}
