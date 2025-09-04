import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomPaginatorComponent } from '../../shared/custom-paginator/custom-paginator.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrdersService } from './orders.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
// PrimeNG
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelect } from 'primeng/multiselect';


interface Order {
    id: number;
    orderNo: string;
    customerName: string;
    date: Date;
    status: string;
    revenue: number;
}

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TableModule,
        DropdownModule,
        InputTextModule,
        ButtonModule,
        SkeletonModule,
        CustomPaginatorComponent,
        ReactiveFormsModule,
        MultiSelect
    ],
    providers: [DatePipe],
    templateUrl: './orders.component.html',
})
export class OrdersComponent {
    private ordersService = inject(OrdersService);
    private destroyRef = inject(DestroyRef);
    private datePipe = inject(DatePipe);
    private translate = inject(TranslateService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    filteredOrders: Order[] = [];
    loading: boolean = true;
    // Paginator
    totalPages: number = 0;
    pageSize = signal<number>(10);
    pageNum: number = 1;
    currentPage = 1;
    skeletonRows = Array(10);
    // Search
    searchControl = new FormControl('');
    // Status
    statusMap: Record<string, string> = {
        Pending: 'ORDER.PENDING',
        Processing: 'ORDER.PROCESSING',
        Shipped: 'ORDER.SHIPPED',
        Completed: 'ORDER.COMPLETED',
        Cancelled: 'ORDER.CANCELLED',
        '': 'ORDER.UNKNOWN'
    };
    filterStatus: string[] = [];
    statusOptions: any[] = [];
    defaultSortField = '';
    defaultSortOrder = 1;

    constructor() {
        // Load settings
        const savedItems = localStorage.getItem('itemsPerPage');
        if (savedItems) this.pageSize.set(Number(savedItems));

        const savedSort = localStorage.getItem('defaultSort');
        if (savedSort) {
            const sortMap: Record<string, { field: string; order: number }> = {
                'name_asc': { field: 'name', order: 1 },
                'name_desc': { field: 'name', order: -1 },
                'price_asc': { field: 'revenue', order: 1 },
                'price_desc': { field: 'revenue', order: -1 },
            };

            const sortConfig = sortMap[savedSort];
            if (sortConfig) {
                this.defaultSortField = sortConfig.field;
                this.defaultSortOrder = sortConfig.order;
            }
        }

        // Subscribe URL changes
        this.route.queryParams
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => {
                const isInitialLoad = params['page'] && params['pageSize'];
                this.handleQueryParams(params);
                if (!isInitialLoad) {
                    this.updateQueryParams({
                        page: this.currentPage,
                        pageSize: this.pageSize()
                    }, true);
                }
                this.buildStatusOptions();
            });
        // Search subscribe
        this.searchControl.valueChanges
            .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe(term => {
                this.updateQueryParams({ search: this.searchControl.value ?? '', page: 1 });
            });
        // Language change
        this.translate.onLangChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.buildStatusOptions();
            });

        effect(() => {
            this.skeletonRows = Array(this.pageSize());
        });
    }

    buildStatusOptions() {
        this.statusOptions = [
            { label: this.translate.instant('ORDER.PENDING'), value: 'Pending' },
            { label: this.translate.instant('ORDER.PROCESSING'), value: 'Processing' },
            { label: this.translate.instant('ORDER.SHIPPED'), value: 'Shipped' },
            { label: this.translate.instant('ORDER.COMPLETED'), value: 'Completed' },
            { label: this.translate.instant('ORDER.CANCELLED'), value: 'Cancelled' }
        ];
    }

    getOrders() {
        this.loading = true;
        this.filteredOrders = [];

        this.ordersService
            .getOrders(this.currentPage, this.pageSize(), this.searchControl.value ?? '', this.filterStatus)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                this.filteredOrders = res.data;
                this.totalPages = Math.ceil(res.total / this.pageSize());
                this.loading = false;
            });
    }

    goToDetail(order: Order) {
        const params = this.route.snapshot.queryParams;
        this.router.navigate(['/orders', order.id], { queryParams: params });
    }

    onPageChange(page: number) {
        this.updateQueryParams({ page });
    }

    onPageSizeChange(size: number) {
        this.updateQueryParams({ pageSize: size, page: 1 });
    }

    formatDate(date: Date) {
        return this.datePipe.transform(date, 'medium', undefined, this.translate.getCurrentLang());
    }

    onFilterStatusChange() {
        this.updateQueryParams({ status: this.filterStatus.join(','), page: 1 });
    }

    private handleQueryParams(params: Params) {
        this.currentPage = +params['page'] || 1;
        this.pageSize.set(+params['pageSize'] || this.pageSize());
        this.searchControl.setValue(params['search'] || '', { emitEvent: false });
        this.filterStatus = params['status'] ? params['status'].split(',') : [];

        this.getOrders();
    }

    private updateQueryParams(
        update: Partial<{ page: number; pageSize: number; search: string; status: string }>,
        replaceUrl: boolean = false
    ) {
        const queryParams: any = {
            page: this.currentPage,
            pageSize: this.pageSize(),
            search: this.searchControl.value ?? '',
            status: this.filterStatus.join(','),
            ...update
        };

        this.router.navigate([], {
            queryParams,
            queryParamsHandling: 'merge',
            replaceUrl
        });
    }

}
