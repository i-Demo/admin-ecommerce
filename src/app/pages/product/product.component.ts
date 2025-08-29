import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { Product, ProductService } from './product.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomPaginatorComponent } from "../../shared/custom-paginator/custom-paginator.component";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-product',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, SkeletonModule, MultiSelectModule, TranslateModule, ProgressSpinnerModule,
        InputGroupModule, InputNumberModule, CustomPaginatorComponent, MenuModule, ConfirmDialogModule],
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    providers: [ConfirmationService]
})
export class ProductComponent {
    private productService = inject(ProductService);
    private destroyRef = inject(DestroyRef);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);

    // Dashboard stats
    totalProductsAvailable = 19740;
    totalProducts = 28205;
    newProductsThisMonth = 123;
    highRatingProducts = 456;
    lowRatingProducts = 78;
    // Search
    searchTerm: string = '';
    // Stock filter
    filterStockMin: number | null = null;
    filterStockMax: number | null = null;
    // Price filter
    filterPriceMin: number | null = null;
    filterPriceMax: number | null = null;
    // Paginator
    totalPages: number = 0;
    pageSize = signal<number>(10);
    pageNum: number = 1;
    currentPage = 1;

    filteredProducts: Product[] = [];
    loading: boolean = true;
    skeletonRows = Array(10);
    isExporting: boolean = false;
    menuItems: any[] = [];
    isCallAPI: boolean = false;

    constructor() {
        const savedItems = localStorage.getItem('itemsPerPage');
        if (savedItems) this.pageSize.set(Number(savedItems));
        this.getProducts();

        effect(() => {
            this.skeletonRows = Array(this.pageSize());
        });
    }

    showActionMenu(product: Product) {
        const blockTitle = product.status === 'Active' ? this.translate.instant('BLOCK') : this.translate.instant('UNBLOCK');
        this.menuItems = [
            {
                label: this.capitalize(blockTitle),
                icon: 'pi pi-ban',
                command: () => this.confirmAction(product, 'block')
            },
            {
                label: this.capitalize(this.translate.instant('DELETE')),
                icon: 'pi pi-trash',
                command: () => this.confirmAction(product, 'delete'),
                styleClass: 'p-menuitem-delete',
            }
        ];
    }


    getProducts() {
        this.loading = true;
        this.productService
            .getProducts(this.currentPage, this.pageSize(), this.searchTerm, this.filterStockMin, this.filterStockMax, this.filterPriceMin, this.filterPriceMax)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                this.filteredProducts = res.data;
                this.totalPages = Math.ceil(res.total / this.pageSize());
                this.loading = false;
            });
    }

    exportProducts(): void {
        this.isExporting = true;
        const exportData = this.filteredProducts.map(p => ({
            ID: p.id,
            Name: p.name,
            SKU: p.sku,
            'Shop Name': p.shopName,
            'Seller ID': p.sellerId,
            'In Stock': p.inStock,
            Sold: p.sold,
            Price: p.price,
            Status: p.status,
            Category: p.category
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');

        // Export file
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, 'products.xlsx');
        this.isExporting = false;
    }


    resetFilters() {
        this.searchTerm = '';
        this.filterStockMin = null;
        this.filterStockMax = null;
        this.filterPriceMin = null;
        this.filterPriceMax = null;
        this.currentPage = 1;
        this.getProducts();
    }


    // FILTER
    applyFilters() {
        this.currentPage = 1;
        this.getProducts();
    }

    onPageChange(page: number) {
        this.currentPage = page;
        this.getProducts();
    }

    onPageSizeChange(size: number) {
        this.pageSize.set(size);
        this.currentPage = 1;
        this.getProducts();
    }

    confirmAction(product: Product, action: 'block' | 'delete') {
        let actionText: string = '';
        if (action === 'delete') {
            actionText = this.translate.instant('DELETE');
        } else {
            actionText = product.status === 'Active' ? this.translate.instant('BLOCK') : this.translate.instant('UNBLOCK');
        }
        const label = this.translate.instant('CONFIRM_LABEL', { syntax: actionText });
        const content = this.translate.instant('CONFIRM_CONTENT', { syntax: actionText });
        const cancel = this.translate.instant('CANCEL');

        this.confirmationService.confirm({
            message: content,
            header: label,
            acceptLabel: this.capitalize(actionText),
            rejectLabel: cancel,
            accept: () => this.executeAction(product, action),
            acceptVisible: true,
            rejectVisible: true
        });
    }


    executeAction(product: Product, action: 'block' | 'delete') {
        this.isCallAPI = true;

        if (action === 'delete') {
            // Gọi API xóa sản phẩm
            this.productService.deleteProduct(product.id).subscribe({
                next: (res) => {
                    this.isCallAPI = false;
                    this.getProducts();
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('DELETE_SUCCESS'),
                        detail: this.translate.instant('PRODUCT_DELETED', { name: product.name })
                    });
                },
                error: (err) => {
                    this.isCallAPI = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('ERROR'),
                        detail: this.translate.instant('DELETE_FAILED')
                    });
                }
            });
        } else if (action === 'block') {
            setTimeout(() => {
                this.isCallAPI = false;
                const isActive = product.status === 'Active';
                product.status = isActive ? 'Inactive' : 'Active';

                const actionKey = isActive ? 'PRODUCT_BLOCKED' : 'PRODUCT_UNBLOCKED';
                const summaryKey = isActive ? 'BLOCK_SUCCESS' : 'UNBLOCK_SUCCESS';
                const actionText = this.translate.instant(actionKey, { name: product.name });
                const summaryText = this.translate.instant(summaryKey);

                this.messageService.add({
                    severity: 'success',
                    summary: summaryText,
                    detail: actionText
                });
            }, 1500);
        }
    }

    capitalize(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
