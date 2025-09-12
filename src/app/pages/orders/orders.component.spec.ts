// orders.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersComponent } from './orders.component';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Pipe, PipeTransform } from '@angular/core';
import { OrdersService } from './orders.service'; // ⚠️ sửa path đúng theo project bạn

// ===== Mock TranslatePipe =====
@Pipe({ name: 'translate', standalone: false })
class MockTranslatePipe implements PipeTransform {
    transform(value: any): any {
        return value; // đơn giản trả về key luôn
    }
}

// ===== Mock OrdersService =====
class MockOrdersService {
    getOrders() {
        return of({
            data: [{ id: 1, orderNo: 'ORD001', customerName: 'John Doe', date: new Date(), status: 'Pending', revenue: 100 }],
            total: 1
        });
    }
}

// ===== Mock Router =====
class MockRouter {
    navigate() { }
}

describe('OrdersComponent (basic with MockTranslatePipe)', () => {
    let component: OrdersComponent;
    let fixture: ComponentFixture<OrdersComponent>;
    let ordersService: MockOrdersService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrdersComponent],           // Standalone component
            declarations: [MockTranslatePipe],    // Mock pipe chuẩn
            providers: [
                { provide: OrdersService, useClass: MockOrdersService },
                { provide: Router, useClass: MockRouter },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(OrdersComponent);
        component = fixture.componentInstance;
        ordersService = TestBed.inject(OrdersService) as unknown as MockOrdersService;

        fixture.detectChanges(); // trigger ngOnInit
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call ordersService.getOrders and set data', () => {
        spyOn(ordersService, 'getOrders').and.callThrough();
        // gọi hàm getOrders trực tiếp
        component.getOrders();
        fixture.detectChanges();

        expect(ordersService.getOrders).toHaveBeenCalled();
        expect(component.filteredOrders.length).toBe(1);
        expect(component.totalPages).toBe(1);
        expect(component.loading).toBeFalse();
    });

    it('should format date correctly', () => {
        const date = new Date('2025-09-11T00:00:00');
        const formatted = component.formatDate(date);
        expect(formatted).toBeTruthy(); // trả về string
    });

    it('should navigate to detail', () => {
        const order = { id: 123 } as any;
        const router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        component.goToDetail(order);
        expect(router.navigate).toHaveBeenCalledWith(['management/orders', 123], { queryParams: {} });
    });
});
