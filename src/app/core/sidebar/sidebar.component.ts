import { Component, Input, Output, EventEmitter } from '@angular/core';
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

    menu: MenuItem[] = [
        { label: 'DASHBOARD', icon: 'pi pi-home', route: '/dashboard' },
        { label: 'Users', icon: 'pi pi-users', route: '/users' },
        { label: 'Settings', icon: 'pi pi-cog', route: '/settings' },
        { label: 'Reports', icon: 'pi pi-chart-line', route: '/reports' },
    ];

    toggleSidebar() {
        this.toggle.emit();
    }
}
