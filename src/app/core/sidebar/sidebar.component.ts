import { Component, Input, Output, EventEmitter, HostListener, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SidebarModule } from 'rbn-common-lib';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface MenuItem {
    label: string;
    icon: string;
    route?: string;
    children?: MenuItem[];
}

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterModule, ButtonModule, TooltipModule, TranslateModule, SidebarModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',

})
export class SidebarComponent {
    @Output() toggle = new EventEmitter<void>();

    private translate = inject(TranslateService);

    isMobile: boolean = false;
    menu: MenuItem[] = [
        { label: 'DASHBOARD', icon: 'pi pi-home', route: '/dashboard' },
        { label: 'PRODUCT', icon: 'pi pi-box', route: '/product' },
        { label: 'ORDER_MANAGEMENT', icon: 'pi pi-shopping-cart', route: '/orders' },
        { label: 'SETTING', icon: 'pi pi-cog', route: '/settings' },
    ];

    // Rbn-sidebar
    useFavorites: boolean = true;
    useSearch: boolean = true;
    useConfigurationMode: boolean = true;
    useLocalStorage: boolean = true;
    idWithoutSpace: boolean = true;
    noneUppercaseParentLabel: boolean = true;
    favoriteIds: any[] = [];
    menuItems: any[] = [];
    private destroyRef = inject(DestroyRef);

    constructor() {
        // Language change
        this.translate.onLangChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.initSidebar();
            });
    }

    initSidebar() {
        this.menuItems = [
            {
                path: 'dashboard',
                data: {
                    menu: {
                        title: this.translate.instant('DASHBOARD'),
                        sidebarLabel: this.translate.instant('DASHBOARD'),
                        icon: 'fa fa-home',
                        topLevel: true
                    }
                },
            },
            {
                path: 'management',
                data: {
                    menu: {
                        title: this.translate.instant('MANAGEMENT'),
                        sidebarLabel: this.translate.instant('MANAGEMENT'),
                        icon: 'fa fa-tools',
                        topLevel: true
                    }
                },
                children: [
                    {
                        path: 'product',
                        data: {
                            menu: {
                                title: this.translate.instant('PRODUCT_MANAGEMENT'),
                                sidebarLabel: this.translate.instant('PRODUCT_MANAGEMENT')
                            }
                        }
                    },
                    {
                        path: 'orders',
                        data: {
                            menu: {
                                title: this.translate.instant('ORDER_MANAGEMENT'),
                                sidebarLabel: this.translate.instant('ORDER_MANAGEMENT')
                            }
                        }
                    }
                ]
            },
            {
                path: 'settings',
                data: {
                    menu: {
                        title: this.translate.instant('SETTING'),
                        sidebarLabel: this.translate.instant('SETTING'),
                        icon: 'fa fa-home',
                        topLevel: true
                    }
                },
            },
        ];
    }

    toggleSidebar() {
        this.toggle.emit();
    }

    // Rbn common
    handleConfigure(event: any) {
        console.log(event);

    }

    favoriteChanged(item: any) {
        console.log(item);
        this.favoriteIds = [...item];
    }

    noChildClicked(event: any) {
        console.log(event);
    }

    handleToggleMenu(event: any) {
        this.toggle.emit(event)
    }
}
