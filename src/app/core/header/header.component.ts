import { Component, inject, effect, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule, HeaderlogoModule } from 'rbn-common-lib';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../services/theme.service';

interface Language {
    code: string;
    label: string;
    flag: string;
    value: string;
}

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, ButtonModule, FormsModule, TranslateModule, SelectModule, RouterLink, HeaderlogoModule, ConfirmDialogModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    private translate = inject(TranslateService);
    private router = inject(Router);
    private themeService = inject(ThemeService);
    private doc = inject(DOCUMENT);

    langs: Language[] = [
        { label: 'English', value: 'en', code: 'EN', flag: '🇺🇸' },
        { label: 'Vietnamese', value: 'vi', code: 'VI', flag: '🇻🇳' },
    ];
    selectedLang = signal<Language | null>(null);
    user = { name: 'Vĩ Hồ', email: 'idemo_test@gmail.com' };
    showMenu = signal(false);
    isShowConfirmDialog = false;

    constructor() {
        const langValue = localStorage.getItem('lang');
        const lang = this.langs.find(l => l.value === langValue) || this.langs[0];
        this.selectedLang.set(lang);

        effect(() => {
            const lang = this.selectedLang();
            if (!lang) return;
            localStorage.setItem('lang', lang.value);
            this.translate.use(lang.value);
        });

        this.doc.addEventListener('click', this.clickListener);
        this.doc.addEventListener('keydown', this.escListener);
    }

    private clickListener = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) this.showMenu.set(false);
    };

    private escListener = (event: KeyboardEvent) => {
        if (event.key === 'Escape') this.showMenu.set(false);
    };

    get isLightTheme() {
        return this.themeService.isLightTheme();
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    setLang(lang: Language) {
        this.selectedLang.set(lang);
    }

    toggleMenu() {
        this.showMenu.set(!this.showMenu());
    }

    logout() {
        this.isShowConfirmDialog = true;
    }

    cancelLogout() {
        this.isShowConfirmDialog = false;
    }

    confirmLogout(event: boolean) {
        if (event) {
            localStorage.removeItem('auth_token');
            this.router.navigate(['/login']);
        } else {
            this.isShowConfirmDialog = false;
        }
    }

    get userInitials() {
        const parts = this.user.name.trim().split(' ');
        if (parts.length === 1) return parts[0][0];
        return parts[0][0] + parts[parts.length - 1][0];
    }

    ngOnDestroy() {
        this.doc.removeEventListener('click', this.clickListener);
        this.doc.removeEventListener('keydown', this.escListener);
    }
}
