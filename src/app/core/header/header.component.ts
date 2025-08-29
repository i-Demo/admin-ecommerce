import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { SelectModule } from 'primeng/select';

interface Language {
    code: string;
    label: string;
    flag: string;
    value: string;
}

@Component({
    selector: 'app-header',
    imports: [CommonModule, ButtonModule, FormsModule, TranslateModule, SelectModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {
    private translate = inject(TranslateService);
    private router = inject(Router);
    private tokenKey = 'auth_token';
    private doc = inject(DOCUMENT);

    langs: Language[] = [
        { label: 'English', value: 'en', code: 'EN', flag: '🇺🇸' },
        { label: 'Vietnamese', value: 'vi', code: 'VI', flag: '🇻🇳' },
    ];

    selectedLang = signal<Language | null>(null);
    isLightTheme = signal(true);
    // User
    user = { name: 'Vĩ Hồ', email: 'idemo_test@gmail.com' };
    showMenu = signal(false);

    private clickListener = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu-container')) {
            this.showMenu.set(false);
        }
    };

    private escListener = (event: KeyboardEvent) => {
        if (event.key === 'Escape') this.showMenu.set(false);
    };

    constructor() {
        // Lang
        const langValue = localStorage.getItem('lang');
        const lang = this.langs.find(l => l.value === langValue) || this.langs[0];
        this.selectedLang.set(lang);

        effect(() => {
            const lang = this.selectedLang();
            if (!lang) return;
            localStorage.setItem('lang', lang.value);
            this.translate.use(lang.value);
        });

        // Theme
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            this.isLightTheme.set(false);
        } else {
            this.isLightTheme.set(true);
        }

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

        // User menu click
        this.doc.addEventListener('click', this.clickListener);
        this.doc.addEventListener('keydown', this.escListener);
    }

    toggleTheme() {
        this.isLightTheme.set(!this.isLightTheme());
    }

    setLang(lang: Language) {
        this.selectedLang.set(lang);
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        this.router.navigate(['/login']);
    }

    // Avatar menu
    toggleMenu() {
        this.showMenu.set(!this.showMenu());
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
