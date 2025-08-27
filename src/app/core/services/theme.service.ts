import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private darkMode = false;

    toggleTheme() {
        this.darkMode = !this.darkMode;
        if (this.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    isDark(): boolean {
        return this.darkMode;
    }
}
