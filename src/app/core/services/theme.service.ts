import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    isLightTheme = signal(true);

    constructor() {
        const theme = localStorage.getItem('theme');
        this.isLightTheme.set(theme !== 'dark');

        effect(() => {
            if (this.isLightTheme()) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    toggleTheme() {
        this.isLightTheme.set(!this.isLightTheme());
    }
}
