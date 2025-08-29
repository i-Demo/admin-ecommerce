import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { CustomPaginatorComponent } from '../../shared/custom-paginator/custom-paginator.component';

interface Order {
    id: number;
    orderNo: string;
    customerName: string;
    date: Date;
    status: string;
    total: number;
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
        CustomPaginatorComponent
    ],
    templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    loading: boolean = true;

    searchText: string = '';
    filterStatus: string = '';
    rowsPerPage: number = 10;

    statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

    // Paginator
    totalPages: number = 0;
    pageSize = signal<number>(10);
    pageNum: number = 1;
    currentPage = 1;

    constructor(private router: Router, private translate: TranslateService) { }

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        setTimeout(() => {
            this.orders = Array.from({ length: 42 }, (_, i) => ({
                id: i + 1,
                orderNo: `ORD-${1000 + i + 1}`,
                customerName: ['John Doe', 'Jane Smith', 'Alice', 'Bob'][i % 4],
                date: new Date(Date.now() - i * 86400000),
                status: this.statusOptions[i % this.statusOptions.length],
                total: Math.floor(Math.random() * 500) + 50
            }));
            this.filteredOrders = [...this.orders.slice(0, 10)];
            this.loading = false;
        }, 1000);
    }

    searchFilter() {
        this.filteredOrders = this.orders.filter(o =>
            o.orderNo.toLowerCase().includes(this.searchText.toLowerCase()) ||
            o.customerName.toLowerCase().includes(this.searchText.toLowerCase())
        );
        if (this.filterStatus) {
            this.filteredOrders = this.filteredOrders.filter(o => o.status === this.filterStatus);
        }
    }

    goToDetail(order: Order) {
        this.router.navigate(['/orders', order.id]);
    }

    onPageChange(page: number) {
        // this.currentPage = page;
        // this.getProducts();
    }

    onPageSizeChange(size: number) {
        // this.pageSize.set(size);
        // this.currentPage = 1;
        // this.getProducts();
    }
}
