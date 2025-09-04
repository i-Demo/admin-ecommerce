import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs';

interface Order {
    id: number;
    orderNo: string;
    customerName: string;
    date: Date;
    status: string;
    revenue: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
    private orders$ = new BehaviorSubject<Order[]>([]);

    constructor(private http: HttpClient) {
        const statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
        const orders: Order[] = Array.from({ length: 76 }, (_, i) => ({
            id: i + 1,
            orderNo: `ORD-${1000 + i + 1}`,
            customerName: ['John Doe', 'Jane Smith', 'Alice', 'Bob'][i % 4],
            date: new Date(Date.now() - i * 86400000),
            status: statusOptions[i % statusOptions.length],
            revenue: Math.floor(Math.random() * 500) + 50,
        }));

        this.orders$.next(orders);
    }

    getOrders(
        page: number,
        pageSize: number,
        search?: string,
        status?: string[]
    ): Observable<{ total: number; data: Order[] }> {
        return this.orders$.asObservable().pipe(
            delay(500),
            map(orders => {
                let filtered = [...orders];
                if (search) {
                    const searchLower = search.toLowerCase().trim();
                    
                    filtered = filtered.filter(
                        (o) => o.orderNo.toLowerCase().includes(searchLower)
                    );

                }

                if (status && (Array.isArray(status) ? status.length > 0 : true)) {
                    if (Array.isArray(status)) {
                        filtered = filtered.filter((o) => status.includes(o.status));
                    } else {
                        filtered = filtered.filter((o) => o.status === status);
                    }
                }

                const total = filtered.length;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;

                return {
                    total,
                    data: filtered.slice(start, end)
                };
            })
        )

    }
}
