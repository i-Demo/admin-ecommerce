import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

@Component({
    selector: 'app-dashboard',
    imports: [FormsModule, ButtonModule, CardModule, TableModule, ChartModule, ToastModule, RippleModule, DatePickerModule, TranslateModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
    kpi: { orders: number; revenue: number; customers: number; pending: number } = { orders: 0, revenue: 0, customers: 0, pending: 0 };
    revenueData: any;
    orderStatusData: any;
    chartOptions: any;
    topProducts: any[] = [];
    searchProduct: string = '';
    fromDate: Date | null = null;
    toDate: Date | null = null;
    currentDatepicker: string = 'week';
    // default preferences table
    itemsPerPage = signal<number>(10);
    defaultSortField = 'name';
    defaultSortOrder = 1;

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
            });

        const savedItems = localStorage.getItem('itemsPerPage');
        if (savedItems) this.itemsPerPage.set(Number(savedItems));

        const savedSort = localStorage.getItem('defaultSort');
        if (savedSort) {
            switch (savedSort) {
                case 'Name Asc': this.defaultSortField = 'name'; this.defaultSortOrder = 1; break;
                case 'Name Desc': this.defaultSortField = 'name'; this.defaultSortOrder = -1; break;
                case 'Price Asc': this.defaultSortField = 'revenue'; this.defaultSortOrder = 1; break;
                case 'Price Desc': this.defaultSortField = 'revenue'; this.defaultSortOrder = -1; break;
            }
        }
    }

    ngOnInit() {
        this.initCharts();
        this.generateTopProducts();
        this.setThisWeek();
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
        this.chartOptions = { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false };
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

    get filteredProducts() {
        const filtered = this.searchProduct
            ? this.topProducts.filter(p => p.name.toLowerCase().includes(this.searchProduct.toLowerCase()))
            : this.topProducts;
        return filtered.sort((a, b) => b.revenue - a.revenue);
    }
}
