import { TestBed } from '@angular/core/testing';
import { DemoPageComponent, MockTranslatePipe } from './demo-page.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';

describe('DemoPageComponent', () => {
    let component: DemoPageComponent;
    let routerSpy: { navigate: jest.Mock };

    beforeEach(() => {
        routerSpy = { navigate: jest.fn() };

        TestBed.configureTestingModule({
            imports: [DemoPageComponent, FormsModule, ButtonModule, InputTextModule, MockTranslatePipe],
            providers: [
                { provide: Router, useValue: routerSpy }
            ]
        });

        const fixture = TestBed.createComponent(DemoPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should have 25 items initially', () => {
        expect(component.items.length).toBe(25);
        expect(component.filteredItems().length).toBe(component.pageSize);
    });

    it('should filter items based on searchTerm', () => {
        component.searchTerm.set('Item 1');
        component.updateFilteredItems();
        const filtered = component.filteredItems();
        expect(filtered.every(i => i.name.includes('1'))).toBe(true);
    });

    it('should toggle theme', () => {
        const initial = component.isLightTheme();
        component.toggleTheme();
        expect(component.isLightTheme()).toBe(!initial);
    });

    it('should navigate to /login on logout', () => {
        component.logout();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should go to next page', () => {
        const initialPage = component.currentPage;
        component.nextPage();
        expect(component.currentPage).toBe(initialPage + 1);
    });

    it('should go to previous page', () => {
        component.currentPage = 2;
        component.prevPage();
        expect(component.currentPage).toBe(1);
    });

    it('should not go before first page', () => {
        component.currentPage = 1;
        component.prevPage();
        expect(component.currentPage).toBe(1);
    });
});
