import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterLink, ButtonModule, InputTextModule, TranslateModule],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
    private router = inject(Router);

    goBack() {
        // quay lại trang trước, nếu không có thì về dashboard
        if (window.history.length > 1) history.back();
        else this.router.navigate(['/dashboard']);
    }

    goHome() {
        this.router.navigate(['/dashboard']);
    }

    onSearch(q: string) {
        if (!q.trim()) return;
        // Điều hướng sang trang search của bạn (tùy hệ thống)
        this.router.navigate(['/tasks'], { queryParams: { q } });
    }
}
