import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { ThemeService } from '../../core/services/theme.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ToggleButtonModule, CheckboxModule, TranslateModule, SelectModule],
    templateUrl: './settings.component.html',
})
export class SettingsComponent {
    private translate = inject(TranslateService);
    private messageService = inject(MessageService);
    private themeService = inject(ThemeService);
    // Current tab
    activeTab: string = 'account';

    // Account & Security
    twoFAEnabled: boolean = false;
    password: string = '';
    newPassword = '';
    confirmPassword: string = '';

    // Product Preferences
    itemsPerPage = signal<number>(10);
    defaultSort = signal<string>('Name Asc');
    pageSizeOptions = [
        { label: '5', value: 5 },
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 }
    ];
    sortOrderOptions = [
        { label: 'SORT_NONE', value: 'none' },
        { label: 'SORT_NAME_ASC', value: 'name_asc' },
        { label: 'SORT_NAME_DESC', value: 'name_desc' },
        { label: 'SORT_PRICE_ASC', value: 'price_asc' },
        { label: 'SORT_PRICE_DESC', value: 'price_desc' }
    ];

    constructor() {
        const savedItems = localStorage.getItem('itemsPerPage');
        if (savedItems) this.itemsPerPage.set(Number(savedItems));

        const savedSort = localStorage.getItem('defaultSort');
        if (savedSort) {
            this.defaultSort.set(savedSort);
        } else {
            this.defaultSort.set(this.sortOrderOptions[0].value);
        }

        effect(() => {
            localStorage.setItem('itemsPerPage', this.itemsPerPage().toString());
        });

        effect(() => {
            localStorage.setItem('defaultSort', this.defaultSort());
        });
    }

    get isLightTheme() {
        return this.themeService.isLightTheme();
    }

    updatePassword() {
        if (!this.newPassword || !this.confirmPassword) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('PASSWORD.WARNING'),
                detail: this.translate.instant('PASSWORD.FILL_FIELDS')
            });
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('PASSWORD.ERROR'),
                detail: this.translate.instant('PASSWORD.MISMATCH')
            });
            return;
        }

        // Call API update password
        this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('PASSWORD.SUCCESS'),
            detail: this.translate.instant('PASSWORD.UPDATED')
        });
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }
}
