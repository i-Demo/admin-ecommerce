import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
        DatePipe,
        SkeletonModule
    ]
})
export class OrderDetailComponent implements OnInit {
    order: Order | null = null;
    loading: boolean = true;

    statusIcons: Record<string, string> = {
        Pending: 'pi pi-clock text-yellow-500',
        Processing: 'pi pi-cog text-blue-500',
        Shipped: 'pi pi-truck text-indigo-500',
        Completed: 'pi pi-check text-green-500',
        Cancelled: 'pi pi-times text-red-500'
    };

    constructor(
        private route: ActivatedRoute,
        private translate: TranslateService
    ) { }

    ngOnInit() {
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
        return {
            id: Number(orderId),
            orderNo: `ORD-${1000 + Number(orderId)}`,
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            shippingAddress: '123 Main St, City, Country',
            date: new Date(),
            status: 'Processing',
            total: 350,
            items: [
                { name: 'Product A', quantity: 2, price: 50 },
                { name: 'Product B', quantity: 3, price: 50 },
                { name: 'Product C', quantity: 1, price: 100 }
            ],
            paymentMethod: 'Credit Card',
            paymentStatus: 'Paid',
            shippingMethod: 'FedEx',
            shippingStatus: 'Shipped',
            activity: [
                { status: 'Pending', user: 'Admin', date: new Date(new Date().getTime() - 86400000), comment: 'Order created' },
                { status: 'Processing', user: 'Admin', date: new Date(new Date().getTime() - 43200000), comment: 'Payment confirmed' },
                { status: 'Shipped', user: 'Courier', date: new Date(new Date().getTime() - 21600000), comment: 'Package shipped' }
            ]
        };
    }

    isCurrentStep(status: string) {
        if (!this.order) return false;
        const statuses = ['Pending', 'Processing', 'Shipped', 'Completed'];
        const currentIndex = statuses.indexOf(this.order.status);
        const statusIndex = statuses.indexOf(status);
        return statusIndex === currentIndex;
    }
}
