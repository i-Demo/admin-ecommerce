import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
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
import { ColumnHidingMode, ExpandDataMode, ExpandDisplayType, FieldName, FilterTypes, Icols, IPageHeader, ITableConfig, ItemDropdown, PageHeaderModule, PaginatorMode, RbnCommonTableModule, rowExpandMode } from 'rbn-common-lib';
import { Router } from '@angular/router';

@Component({
    selector: 'app-product',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, SkeletonModule, TranslateModule, ProgressSpinnerModule,
        InputGroupModule, InputNumberModule, MenuModule, ConfirmDialogModule, PageHeaderModule, RbnCommonTableModule, CustomPaginatorComponent],
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
    private router = inject(Router);

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
    // Status filter
    filterStatus: 'active' | 'inactive' | null = null;
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
    headerData: IPageHeader = {};

    // rbn-table
    tableConfig: ITableConfig = {
        paginatorMode: PaginatorMode.Client,
        header: {
            title: 'Product Management',
            breadcrumb: [
                {
                    label: 'Dashboard',
                    command: (event) => {
                        this.router.navigate(['/dashboard'])
                    }
                },
                { label: 'Product Management' }
            ],
            topButton: {
                label: 'New Product',
                icon: 'pi pi-plus',
                title: 'Test action',
                onClick: () => console.log('Click New'),
                iconPos: 'left',
                isDisplay: true
            }
        },
        tableOptions: {
            dataKey: 'product',
            selectionMode: 'multiple',
            hideTableButtons: false,
            hideCheckboxAll: false,
            hideColumnInLib: true,
            show3DotsButton: true,
            rowExpandMode: rowExpandMode.Multiple,
            btn3DotsConfig: {
                exportCSVByLib: true,
                exportPDFByLib: true
            }
        },
        selectedRows: [],
        tableName: 'productTable',
        numberRowPerPage: 10,
        rowsPerPageOptions: [5, 10, 20],
        isSupportGrouping: true,
        isScrollable: true,
        scrollX: true,
        columnHidingMode: ColumnHidingMode.Simple,
        expandDataMode: ExpandDataMode.Client,
        expandDisplayType: ExpandDisplayType.Table,
        loading: false,
        isShowContextMenu: true,
        actionColumnConfig: {
            actions: [
                {
                    icon: 'fas fa-pen', label: 'Edit', onClick: (data: any, index: number) => {
                        console.log('table action 1');
                        console.log(data);
                        console.log(index);
                    }
                },
                {
                    icon: 'fas fa-trash', label: 'Delete', onClick: (data: any, index: number) => {
                        console.log('table action 2')
                    }
                }
            ]
        },
    };

    cols = [
        { field: FieldName.Checkbox, header: '', sort: false, data: [], colsEnable: true },
        { field: 'product', header: 'Product', sort: true, type: FilterTypes.InputText, colsEnable: true, data: [], allowHide: false },
        { field: 'sku', header: 'SKU', sort: true, type: FilterTypes.InputText, colsEnable: true, data: [] },
        { field: 'shopName', header: 'Shop Name', sort: true, type: FilterTypes.InputText, colsEnable: true, data: [] },
        { field: 'sellerId', header: 'Seller ID', sort: true, type: FilterTypes.InputText, colsEnable: true, data: [] },
        { field: 'category', header: 'Category', sort: true, type: FilterTypes.InputText, colsEnable: true, data: [] },
        { field: 'inStock', header: 'In Stock', sort: true, type: FilterTypes.InputText, colsEnable: true, data: [] },
        { field: 'sold', header: 'Sold', sort: true, type: FilterTypes.InputText, colsEnable: true, data: [] },
        { field: 'price', header: 'Price', sort: true, type: FilterTypes.InputText, colsEnable: true, data: [] },
        {
            field: 'seller', header: 'Seller', sort: false, data: [], colsEnable: true, options: { usingInputSwitch: true },
            colDisable: false
        },
        { field: FieldName.Action, header: 'Action', sort: false, colsEnable: true, data: [], allowHide: false }
    ];

    data = [
        {
            product: 'Laptop Dell XPS', sku: 'DLX123', shopName: 'TechShop', sellerId: 'S001', category: 'Laptop', inStock: 25, sold: 10, price: 1200, seller: true,
            children: [
                {
                    product: 'Dell XPS 13', sku: 'DLX123-13', shopName: 'TechShop', sellerId: 'S001', category: 'Laptop', inStock: 10, sold: 5, price: 1100, seller: true,
                },
                {
                    product: 'Dell XPS 15', sku: 'DLX123-15', shopName: 'TechShop', sellerId: 'S001', category: 'Laptop', inStock: 15, sold: 5, price: 1250, seller: true,
                }
            ]
        },
        { product: 'iPhone 15', sku: 'IP15-001', shopName: 'AppleStore', sellerId: 'S002', category: 'Phone', inStock: 50, sold: 30, price: 999, seller: true },
        { product: 'Samsung Galaxy S23', sku: 'SGS23-01', shopName: 'MobileWorld', sellerId: 'S003', category: 'Phone', inStock: 40, sold: 20, price: 899, seller: false },
        { product: 'MacBook Pro 16"', sku: 'MBP16-2023', shopName: 'AppleStore', sellerId: 'S002', category: 'Laptop', inStock: 15, sold: 5, price: 2500, seller: true },
        { product: 'Lenovo ThinkPad X1', sku: 'LTPX1-2022', shopName: 'TechShop', sellerId: 'S001', category: 'Laptop', inStock: 30, sold: 12, price: 1800, seller: true },
        { product: 'Google Pixel 8', sku: 'GPX8-001', shopName: 'MobileWorld', sellerId: 'S003', category: 'Phone', inStock: 60, sold: 25, price: 799, seller: false },
        { product: 'Samsung Galaxy Tab S9', sku: 'SGTS9-01', shopName: 'TechShop', sellerId: 'S001', category: 'Tablet', inStock: 20, sold: 8, price: 650, seller: true },
        { product: 'iPad Pro 12.9"', sku: 'IPAD12-001', shopName: 'AppleStore', sellerId: 'S002', category: 'Tablet', inStock: 35, sold: 18, price: 1200, seller: true },
        { product: 'Asus ROG Zephyrus', sku: 'ARZ-2023', shopName: 'GamingHub', sellerId: 'S004', category: 'Laptop', inStock: 10, sold: 3, price: 2200, seller: true },
        { product: 'Sony WH-1000XM5', sku: 'SONYWH5', shopName: 'AudioStore', sellerId: 'S005', category: 'Accessory', inStock: 45, sold: 22, price: 399, seller: true },
        { product: 'Bose QuietComfort 45', sku: 'BOSEQC45', shopName: 'AudioStore', sellerId: 'S005', category: 'Accessory', inStock: 30, sold: 15, price: 349, seller: true },
        { product: 'HP Spectre x360', sku: 'HPSX360', shopName: 'TechShop', sellerId: 'S001', category: 'Laptop', inStock: 18, sold: 7, price: 1600, seller: true },
        { product: 'OnePlus 11', sku: 'OP11-001', shopName: 'MobileWorld', sellerId: 'S003', category: 'Phone', inStock: 55, sold: 28, price: 699, seller: false },
        { product: 'Dell Inspiron 15', sku: 'DLINSP15', shopName: 'TechShop', sellerId: 'S001', category: 'Laptop', inStock: 40, sold: 20, price: 900, seller: true },
        { product: 'iPhone SE 3', sku: 'IPSE3', shopName: 'AppleStore', sellerId: 'S002', category: 'Phone', inStock: 70, sold: 35, price: 429, seller: true }
    ];

    colsNotHide = [
        FieldName.Action,
    ];

    constructor() {
        if (!this.headerData.title) this.setHeaderData();
        const savedItems = localStorage.getItem('itemsPerPage');
        if (savedItems) this.pageSize.set(Number(savedItems));
        this.getProducts();

        // Language change
        this.translate.onLangChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.setHeaderData();
            });

        effect(() => {
            this.skeletonRows = Array(this.pageSize());
        });
    }

    ngAfterViewInit() {
        // Fill dropdown options for filtering if needed
        this.data.forEach(row => {
            this.cols.forEach(col => this.dataDropdown(col.data, row, col.field));
        });
    }

    dataDropdown(arr: ItemDropdown[], item: any, field: string) {
        if (arr && arr.findIndex(i => i.value === item[field]) === -1) {
            if (item[field]) arr.push(new ItemDropdown(item[field], item[field]));
        }
    }

    switchChange(event: any) {
        console.log('Switch changed');
        console.log(event);
    }

    showActionMenu(product: Product) {
        const blockTitle = product.status === 'active' ? this.translate.instant('BLOCK') : this.translate.instant('UNBLOCK');
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
            .getProducts(
                this.currentPage,
                this.pageSize(),
                this.searchTerm,
                this.filterStockMin,
                this.filterStockMax,
                this.filterPriceMin,
                this.filterPriceMax,
                this.filterStatus
            )
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
            actionText = product.status === 'active' ? this.translate.instant('BLOCK') : this.translate.instant('UNBLOCK');
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
                const isActive = product.status === 'active';
                product.status = isActive ? 'inactive' : 'active';

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

    setHeaderData() {
        this.headerData = {
            title: this.translate.instant('PRODUCT_MANAGEMENT'),
            description: this.translate.instant('ORDER.DESCRIPTION'),
            breadcrumb: [
                { label: this.translate.instant('COMMON.HOME'), routerLink: '/' },
                { label: this.translate.instant('PRODUCT') },
            ],
            topButton: {
                label: this.translate.instant('ADD_PRODUCT'),
                icon: 'pi pi-plus',
                isDisplay: true,
                onClick: () => this.addOrder()
            },
            topDropdown: {
                isDisplay: true,
                content: [
                    { label: this.translate.instant('STATUS.ACTIVE'), value: 'active' },
                    { label: this.translate.instant('STATUS.INACTIVE'), value: 'inactive' }
                ],
                optionLabel: 'label',
                optionValue: 'value',
                onChange: (event: any) => this.onStatusChange(event)
            },
            overlayButton: {
                isDisplay: true,
                menuItem: [
                    {
                        label: this.translate.instant('ORDER.EXPORT_EXCEL'),
                        icon: 'pi pi-file-excel',
                        value: 'EXPORT_EXCEL'
                    },
                ],
            }
        };
    }

    goBack() {
        console.log('Back clicked');
    }

    goBackTable() {
        console.log('goBackTable clicked');
    }

    onSelectMenuItem(item: any) {
        if (item.value === 'EXPORT_EXCEL') {
            this.exportProducts();
        }
    }

    onStatusChange(event: any) {
        this.filterStatus = event.value;
        this.getProducts();
        console.log('Dropdown changed:', event.value);
    }

    addOrder() {
        console.log('Add Order clicked');
    }

    checkboxChange(event: any) {
        console.log(event);
        
    }

}
