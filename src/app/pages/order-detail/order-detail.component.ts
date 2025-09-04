import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderActivity {
    status: string;
    user: string;
    date: Date;
    comment: string;
}

interface Order {
    id: number;
    orderNo: string;
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    date: Date;
    status: string;
    total: number;
    items: OrderItem[];
    paymentMethod: string;
    paymentStatus: string;
    shippingMethod: string;
    shippingStatus: string;
    activity: OrderActivity[];
    voucher?: { code: string; discount: number };
    shippingFee?: number;
}

@Component({
    selector: 'app-order-detail',
    standalone: true,
    templateUrl: './order-detail.component.html',
    imports: [
        CommonModule,
        NgIf,
        NgFor,
        NgClass,
        TranslateModule,
        SkeletonModule
    ],
    providers: [DatePipe],
})
export class OrderDetailComponent {
    order: Order | null = null;
    loading: boolean = true;

    statusIcons: Record<string, string> = {
        Pending: 'pi pi-clock text-yellow-500',
        Confirmed: 'pi pi-check-circle text-green-500',
        Processing: 'pi pi-cog text-blue-500',
        Packed: 'pi pi-box text-purple-500',
        Shipped: 'pi pi-truck text-indigo-500',
        In_Transit: 'pi pi-send text-sky-500',
        Out_for_Delivery: 'pi pi-map-marker text-orange-500',
        Completed: 'pi pi-check text-emerald-600',
        Cancelled: 'pi pi-times text-red-500'
    };

    private route = inject(ActivatedRoute);
    private translate = inject(TranslateService);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    private datePipe = inject(DatePipe);

    constructor() {
        const orderId = this.route.snapshot.paramMap.get('id');
        this.loadOrder(orderId);
    }

    loadOrder(orderId: string | null) {
        setTimeout(() => {
            this.order = this.generateMockOrder(orderId);
            this.loading = false;
        }, 1000);
    }

    generateMockOrder(orderId: string | null): Order {
        const items: OrderItem[] = [
            { name: 'Product A', quantity: 2, price: 50 },
            { name: 'Product B', quantity: 3, price: 50 },
            { name: 'Product C', quantity: 1, price: 100 }
        ];

        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const voucher = {
            code: 'BLACKFRIDAY2024',
            discount: 100,
        };
        const shippingFee = 15;
        const total = subtotal - (voucher?.discount || 0) + shippingFee;

        return {
            id: Number(orderId),
            orderNo: `ORD-${1000 + Number(orderId)}`,
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            shippingAddress: '123 Main St, City, Country',
            date: new Date(),
            status: 'Completed',
            total,
            items,
            paymentMethod: 'CREDIT_CARD',
            paymentStatus: 'Paid',
            shippingMethod: 'FedEx',
            shippingStatus: 'Shipped',
            activity: [
                {
                    status: 'Pending',
                    user: 'Customer',
                    date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
                    comment: 'CREATED'
                },
                {
                    status: 'Confirmed',
                    user: 'Admin',
                    date: new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                    comment: 'CONFIRMED'
                },
                {
                    status: 'Processing',
                    user: 'Admin',
                    date: new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000),
                    comment: 'PAYMENT_VERIFIED'
                },
                {
                    status: 'Packed',
                    user: 'Warehouse',
                    date: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
                    comment: 'PACKED'
                },
                {
                    status: 'Shipped',
                    user: 'Courier',
                    date: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
                    comment: 'SHIPPED'
                },
                {
                    status: 'In_Transit',
                    user: 'Courier',
                    date: new Date(new Date().getTime() - 36 * 60 * 60 * 1000),
                    comment: 'IN_TRANSIT'
                },
                {
                    status: 'Out_for_Delivery',
                    user: 'Courier',
                    date: new Date(new Date().getTime() - 6 * 60 * 60 * 1000),
                    comment: 'OUT_FOR_DELIVERY'
                },
                {
                    status: 'Completed',
                    user: 'Customer',
                    date: new Date(new Date().getTime() - 1 * 60 * 60 * 1000),
                    comment: 'COMPLETED'
                }
            ],
            voucher,
            shippingFee
        };
    }

    isCurrentStep(status: string): boolean {
        if (!this.order) return false;

        const statuses = [
            'Pending',
            'Confirmed',
            'Processing',
            'Packed',
            'Shipped',
            'In_Transit',
            'Out_for_Delivery',
            'Completed',
            'Cancelled'
        ];

        const currentIndex = statuses.indexOf(this.order.status);
        const statusIndex = statuses.indexOf(status);

        return statusIndex === currentIndex;
    }

    goBack() {
        const params = this.route.snapshot.queryParams;
        this.router.navigate(['/orders'], { queryParams: params });
    }

    formatDate(date: Date) {
        return this.datePipe.transform(date, 'medium', undefined, this.translate.getCurrentLang());
    }

    getSubtotal(): number {
        if (!this.order) return 0;
        return this.order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }

    getGrandTotal(): number {
        if (!this.order) return 0;
        const subtotal = this.getSubtotal();
        const voucherDiscount = this.order.voucher?.discount || 0;
        const shippingFee = this.order.shippingFee || 0;
        return subtotal - voucherDiscount + shippingFee;
    }

}
