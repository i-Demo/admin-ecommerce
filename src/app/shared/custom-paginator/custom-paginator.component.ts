import { CommonModule, NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PopoverModule } from 'primeng/popover';

interface PageSize {
    page_size: number;
}

@Component({
    selector: 'app-custom-paginator',
    standalone: true,
    imports: [NgClass, PopoverModule, TranslateModule],
    templateUrl: './custom-paginator.component.html',
    styleUrls: ['./custom-paginator.component.scss']
})
export class CustomPaginatorComponent {
    @Input() current!: number;
    @Input() total!: number;
    @Input() pageSize!: number;
    @Input() pageSizeList: PageSize[] = [
        { page_size: 5 },
        { page_size: 10 },
        { page_size: 20 },
        { page_size: 30 },
        { page_size: 40 },
        { page_size: 50 },
    ];

    @Output() goTo = new EventEmitter<number>();
    @Output() next = new EventEmitter<number>();
    @Output() previous = new EventEmitter<number>();
    @Output() changePageSize = new EventEmitter<number>();

    public pages: number[] = [];
    overlayVisible = false;

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['current'] && changes['current'].currentValue) ||
            (changes['total'] && changes['total'].currentValue)) {
            this.pages = this.getPages(this.current, this.total);
        }
    }

    public onGoTo(page: number): void {
        this.goTo.emit(page);
    }

    public onNext(): void {
        this.next.emit(this.current + 1);
    }

    public onPrevious(): void {
        this.previous.emit(this.current - 1);
    }

    handleChangePageSize(pageSize: number, popover: any): void {
        popover.hide();
        this.changePageSize.emit(pageSize);
    }

    private getPages(current: number, total: number): number[] {
        if (total <= 7) {
            return [...Array(total).keys()].map((x) => ++x);
        }

        if (current >= 3 && current < total - 2) {
            if (current >= total - 4) {
                return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
            }
            if (current >= 5) {
                return [1, -1, current - 1, current, current + 1, -1, total];
            }
            return [1, -1, 3, 4, 5, -1, total];
        }
        return [1, 2, 3, -1, total - 2, total - 1, total];
    }
}
