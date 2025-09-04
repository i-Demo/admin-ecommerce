import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

interface MenuItem {
    label: string;
    icon: string;
    route?: string;
    children?: MenuItem[];
}

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterModule, ButtonModule, TooltipModule, TranslateModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',

})
export class SidebarComponent {
    @Input() open = true;
    @Output() toggle = new EventEmitter<void>();

    isMobile: boolean = false;
    menu: MenuItem[] = [
        { label: 'DASHBOARD', icon: 'pi pi-home', route: '/dashboard' },
        { label: 'PRODUCT', icon: 'pi pi-box', route: '/product' },
        { label: 'ORDER_MANAGEMENT', icon: 'pi pi-shopping-cart', route: '/orders' },
        { label: 'SETTING', icon: 'pi pi-cog', route: '/settings' },
    ];

    ngOnInit() {
        this.checkScreen();
    }

    @HostListener('window:resize')
    onResize() {
        this.checkScreen();
    }

    private checkScreen() {
        this.isMobile = window.innerWidth < 768;
        if (this.isMobile && this.open) {
            this.toggle.emit();
        }
    }

    toggleSidebar() {
        this.toggle.emit();
    }
}
