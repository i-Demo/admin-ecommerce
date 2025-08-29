import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ToggleButtonModule, CheckboxModule, DropdownModule, TranslateModule],
    templateUrl: './settings.component.html',
})
export class SettingsComponent {
    private messageService = inject(MessageService);
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

    // Theme & Layout
    isLightTheme = signal(true);
    compactMode: boolean = false;

    constructor() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            this.isLightTheme.set(false);
        } else {
            this.isLightTheme.set(true);
        }

        const savedItems = localStorage.getItem('itemsPerPage');
        if (savedItems) this.itemsPerPage.set(Number(savedItems));

        const savedSort = localStorage.getItem('defaultSort');
        if (savedSort) this.defaultSort.set(savedSort);

        effect(() => {
            const light = this.isLightTheme();
            if (light) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });

        effect(() => {
            localStorage.setItem('itemsPerPage', this.itemsPerPage().toString());
        });

        effect(() => {
            localStorage.setItem('defaultSort', this.defaultSort());
        });
    }

    saveSettings() {
        const settings = {
            twoFAEnabled: this.twoFAEnabled,
            itemsPerPage: this.itemsPerPage,
            defaultSort: this.defaultSort,
            compactMode: this.compactMode,
        };
        localStorage.setItem('userSettings', JSON.stringify(settings));
        alert('Settings saved!');
    }

    loadSettings() {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            Object.assign(this, settings);
        }
    }

    updatePassword() {
        if (!this.newPassword || !this.confirmPassword) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill both fields' });
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match' });
            return;
        }
        // Call API để update password
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Password updated successfully' });
    }

    toggleTheme() {
        this.isLightTheme.set(!this.isLightTheme());
    }
}
