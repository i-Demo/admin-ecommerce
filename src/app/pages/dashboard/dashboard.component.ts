import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { PrimeNG } from 'primeng/config';
import localeEn from 'primelocale/en.json';
import localeVi from 'primelocale/vi.json';
import { ColumnHidingMode, DateRangePickerComponent, DaterangepickerModule, ExpandDataMode, ExpandDisplayType, FieldName, ITableConfig, PageTopModule, PaginatorMode, RbnCommonTableModule, RbnDynamicFormsModule } from 'rbn-common-lib';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
    selector: 'app-dashboard',
    imports: [FormsModule, ButtonModule, CardModule, TableModule, ChartModule, ToastModule,
        RippleModule, DatePickerModule, TranslateModule, PageTopModule, DaterangepickerModule, RbnDynamicFormsModule, RbnCommonTableModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
    @ViewChild('dateRangePicker') dateRangePicker!: DateRangePickerComponent;
    @ViewChild('dt') table: any;

    kpi: { orders: number; revenue: number; customers: number; pending: number } = { orders: 0, revenue: 0, customers: 0, pending: 0 };
    revenueData: any;
    orderStatusData: any;
    chartOptions: any;
    orderChartOptions: any;
    topProducts: any[] = [];
    searchProduct: string = '';
    fromDate: Date = new Date();
    toDate: Date = new Date();
    currentDatepicker: string = 'week';
    filteredTopProducts: any[] = [];
    // default preferences table
    itemsPerPage = signal<number>(10);
    defaultSortField = '';
    defaultSortOrder = 1;
    ordersUnit = '';
    // rbn-common
    initialFrom = new Date(2024, 0, 1);
    initialTo = new Date(2024, 0, 31);

    // dynamic form
    form = new FormGroup({});
    model: any = {};
    options = {};
    fields: FormlyFieldConfig[] = [];
    // rbn-table
    // Cấu hình cột
    cols = [
        { field: FieldName.Checkbox, header: '', sort: false, data: [], colsEnable: true },
        { field: 'brand', header: 'Brand', sort: true, data: [], colsEnable: true },
        { field: 'year', header: 'Year', sort: true, data: [], colsEnable: true },
        { field: 'color', header: 'Color', sort: true, data: [], colsEnable: true },
        { field: 'seller', header: 'Seller', sort: false, data: [], colsEnable: true, options: { usingInputSwitch: true } },
        { field: FieldName.Action, header: 'Action', sort: false, data: [], colsEnable: true }
    ];

    // Mock dữ liệu
    data = [
        { brand: 'VW', year: 2012, color: 'Orange', seller: true },
        { brand: 'Audi', year: 2015, color: 'Black', seller: false },
        { brand: 'BMW', year: 2020, color: 'Blue', seller: true },
    ];

    // Cấu hình table
    tableConfig: ITableConfig = {
        tableName: 'demoTable',
        paginatorMode: PaginatorMode.Client,
        numberRowPerPage: 5,
        rowsPerPageOptions: [5, 10, 20],
        columnHidingMode: ColumnHidingMode.Simple,
        expandDataMode: ExpandDataMode.Client,
        expandDisplayType: ExpandDisplayType.TabView,
        enableSearchGlobal: true,
        enableFilter: true,
        selectedRows: []
    };

    private destroy$ = new Subject<void>();

    constructor(
        private messageService: MessageService,
        private translate: TranslateService,
        private primeng: PrimeNG,
    ) {
        this.translate.onLangChange
            .pipe(takeUntil(this.destroy$))
            .subscribe((evt: LangChangeEvent) => {
                this.primeng.setTranslation(evt.lang === 'vi' ? (localeVi.vi as any) : (localeEn.en as any));
                this.reTranslateCharts();
                this.ordersUnit = this.translate.instant('ORDERS_UNIT');
            });

        const savedItems = localStorage.getItem('itemsPerPage');
        if (savedItems) this.itemsPerPage.set(Number(savedItems));

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

    }

    ngOnInit() {
        this.initCharts();
        this.generateTopProducts();
        this.setThisWeek();
        this.applyFilter();
        this.initForm();
    }

    ngOnDestroy() {
        this.destroy$.next(void 0);
        this.destroy$.complete();
    }

    /** Quick pick buttons */
    setToday() {
        this.currentDatepicker = 'day';
        const today = new Date();
        this.fromDate = today;
        this.toDate = today;
        this.applyDateRange();
    }

    setThisWeek() {
        this.currentDatepicker = 'week';
        const today = new Date();
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        this.fromDate = firstDay;
        this.toDate = lastDay;
        this.applyDateRange();
    }

    setThisMonth() {
        this.currentDatepicker = 'month';
        const today = new Date();
        this.fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.applyDateRange();
    }

    setThisYear() {
        this.currentDatepicker = 'year';
        const today = new Date();
        this.fromDate = new Date(today.getFullYear(), 0, 1);
        this.toDate = new Date(today.getFullYear(), 11, 31);
        this.applyDateRange();
    }

    onSelectDateRange() {
        this.currentDatepicker = '';
        this.applyDateRange();
    }

    applyDateRange() {
        if (!this.fromDate || !this.toDate) return;
        if (this.dateRangePicker) {
            this.dateRangePicker.pFromDate = this.fromDate; 
            this.dateRangePicker.pToDate = this.toDate;
        }

        const from = new Date(this.fromDate);
        const to = new Date(this.toDate);
        const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Update KPI
        this.kpi = { orders: diffDays * 20, revenue: diffDays * 1000, customers: diffDays * 5, pending: diffDays * 2 };
        this.animateKPI();

        // Update Revenue Trend chart
        const revenueDataArray = Array.from({ length: diffDays }, () => Math.floor(Math.random() * 1000 + 500));
        let labels: string[];
        if (diffDays === 7) {
            const daysOfWeek = this.translate.instant('DAYS_OF_WEEK');
            labels = daysOfWeek;
        } else {
            const dayPrefix = this.translate.instant('DAY_PREFIX');
            labels = Array.from({ length: diffDays }, (_, i) => `${dayPrefix} ${i + 1}`);
        }
        this.revenueData = { ...this.revenueData, datasets: [{ ...this.revenueData.datasets[0], data: revenueDataArray }], labels };

        // Update Order Status chart
        const statusArray = [Math.floor(Math.random() * 20 + 5), Math.floor(Math.random() * 30 + 10), Math.floor(Math.random() * 40 + 15), Math.floor(Math.random() * 50 + 20)];
        this.orderStatusData = { ...this.orderStatusData, datasets: [{ ...this.orderStatusData.datasets[0], data: statusArray }] };
    }

    /** KPI animation */
    animateKPI() {
        const keys: (keyof typeof this.kpi)[] = ['orders', 'revenue', 'customers', 'pending'];
        keys.forEach(key => {
            const target = this.kpi[key];
            let current = 0;
            const interval = setInterval(() => {
                current += Math.ceil(target / 50);
                if (current >= target) { current = target; clearInterval(interval); }
                this.kpi[key] = current;
            }, 20);
        });
    }

    /** Init charts */
    initCharts() {
        this.revenueData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ label: 'Revenue', data: [], fill: false, borderColor: '#3b82f6', tension: 0.4 }]
        };
        this.orderStatusData = {
            labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
            datasets: [{ data: [], backgroundColor: ['#facc15', '#3b82f6', '#10b981', '#8b5cf6'] }]
        };
        this.chartOptions = {
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            let value = context.raw;
                            return `$${value.toLocaleString()}`;
                        }
                    }
                }
            },
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: (value: number) => `$${value}`
                    }
                }
            }
        };

        this.orderChartOptions = {
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            let value = context.raw;
                            return `${value} ${this.ordersUnit}`;
                        }
                    }
                }
            },
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10
                    },
                    grid: {
                        color: 'rgba(200,200,200,0.2)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(200,200,200,0.2)'
                    }
                }
            }
        };
    }

    reTranslateCharts() {
        const orderLabels = this.translate.instant('ORDER_LABELS');
        const revenueLabel = this.translate.instant('REVENUE_LABEL');

        let labels: string[] = [];
        if (this.currentDatepicker === 'week') {
            const daysOfWeek = this.translate.instant('DAYS_OF_WEEK');
            labels = daysOfWeek;
        } else {
            const dayPrefix = this.translate.instant('DAY_PREFIX');
            if (this.revenueData?.labels?.length) {
                labels = this.revenueData.labels.map((l: string, i: number) => {
                    const match = l.match(/(\d+)/);
                    return match ? `${dayPrefix} ${match[1]}` : l;
                });
            }
        }

        if (this.revenueData?.datasets) {
            this.revenueData = {
                ...this.revenueData,
                labels: labels,
                datasets: this.revenueData.datasets.map((ds: any) => ({
                    ...ds,
                    label: revenueLabel
                }))
            };
        }

        if (this.orderStatusData?.datasets) {
            this.orderStatusData = {
                ...this.orderStatusData,
                labels: orderLabels,
                datasets: [...this.orderStatusData.datasets]
            };
        }
    }

    /** Top Products mock */
    generateTopProducts() {
        const categories = ['Electronics', 'Furniture', 'Home', 'Fashion'];
        const productNames = [
            'Wireless Mouse', 'Gaming Keyboard', 'USB-C Hub', 'Bluetooth Speaker', 'Smart Watch',
            'Noise Cancelling Headphones', 'Portable Charger', 'LED Desk Lamp', 'Ergonomic Chair', '4K Monitor',
            'Laptop Stand', 'External SSD', 'Webcam HD', 'Fitness Tracker', 'Smartphone Holder',
            'Mechanical Keyboard', 'VR Headset', 'Graphic Tablet', 'Wireless Earbuds', 'Mini Projector',
            'Smart Thermostat', 'Robot Vacuum', 'Air Purifier', 'Smart Door Lock', 'Smart Light Bulb',
            'Digital Photo Frame', 'Streaming Stick', 'Electric Kettle', 'Coffee Maker', 'Blender',
            'Wireless Charger', 'Tablet Stand', 'Action Camera', 'Smart Pen', 'Portable Monitor',
            'Gaming Chair', 'Smart Scale', 'Dash Cam', '3D Printer', 'LED Strip Light',
            'Noise Cancelling Earbuds', 'Smart Lock', 'Electric Scooter', 'Smart Bike Light', 'Smart Plug',
            'VR Controller', 'Smart Ring', 'Fitness Smartband', 'Portable Projector', 'USB Hub Pro'
        ];

        this.topProducts = productNames.map((name, i) => ({
            name,
            category: categories[i % categories.length],
            sold: Math.floor(Math.random() * 200),
            revenue: Math.floor(Math.random() * 5000)
        }))
            .sort((a, b) => b.revenue - a.revenue);
    }

    onSearchChange() {
        if (this.table) {
            this.table.first = 0;
        }
        this.applyFilter();
    }

    applyFilter() {
        let filtered = this.topProducts;

        if (this.searchProduct && this.searchProduct.trim() !== '') {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(this.searchProduct.toLowerCase())
            );
        }

        this.filteredTopProducts = filtered;
    }

    onDateRangeSelected(event: any) {
        console.log(event);
        this.fromDate = new Date(event.from);
        this.toDate = new Date(event.to);

        console.log('From:', this.fromDate);
        console.log('To:', this.toDate);
    }

    initForm() {
        const col = 'col-12 md:col-6';

        this.fields = [
            {
                fieldGroupClassName: 'grid gap-[6px] grid-cols-2',
                fieldGroup: [
                    {
                        key: 'username',
                        type: 'rbn-input',
                        props: {
                            label: 'Username',
                            required: true,
                            placeholder: 'Enter username',
                            description: 'The system username required to connect to the LDAP server.'
                        },
                        className: col
                    },
                    {
                        key: 'password',
                        type: 'rbn-input',
                        props: {
                            type: 'password',
                            label: 'Password',
                            required: true,
                            placeholder: 'Enter password',
                            description: 'The system password required to connect to the LDAP server.'
                        },
                        className: col
                    },
                    {
                        key: 'email',
                        type: 'rbn-input',
                        props: {
                            type: 'email',
                            label: 'Email',
                            required: true,
                            placeholder: 'Enter email address'
                        },
                        className: col
                    },
                    {
                        key: 'gender',
                        type: 'rbn-singleselect',
                        props: {
                            label: 'Gender',
                            required: true,
                            options: [
                                { label: 'Male', value: 'M' },
                                { label: 'Female', value: 'F' },
                                { label: 'Other', value: 'O' }
                            ],
                            placeholder: 'Select gender'
                        },
                        className: col
                    },
                    {
                        key: 'isActive',
                        type: 'rbn-switch',
                        props: {
                            label: 'Active account',
                            description: 'The flag for LDAP to ignore partial result exception.'
                        },
                        defaultValue: true,
                        className: 'col-span-2'
                    },
                ]
            }

        ];

    }

    submit() {
        if (this.form.valid) {
            console.log('Form value:', this.model);
            console.log('Form value:', this.form);
            // call API
        } else {
            console.log('Form invalid');
        }
    }

    onSwitchChange(event: any) {
        console.log('Switch changed:', event);
    }
}
