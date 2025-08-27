import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../auth.service';
import { catchError, of } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ProgressSpinnerModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    // Signals
    loading = signal(false);
    error = signal('');
    emailError = signal<string | null>(null);
    passwordError = signal<string | null>(null);
    showPassword = signal(false);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        ]]
    });

    constructor() {
        const emailControl = this.loginForm.get('email');
        emailControl?.valueChanges.subscribe(() => {
            if (emailControl.touched || emailControl.dirty) {
                this.error.set('');
                if (emailControl.hasError('required')) this.emailError.set('Email is required');
                else if (emailControl.hasError('email')) this.emailError.set('Invalid email format');
                else this.emailError.set(null);
            }
        });

        const passwordControl = this.loginForm.get('password');
        passwordControl?.valueChanges.subscribe(() => {
            if (passwordControl.touched || passwordControl.dirty) {
                this.error.set('');
                if (passwordControl.hasError('required')) this.passwordError.set('Password is required');
                else if (passwordControl.hasError('minlength')) this.passwordError.set('Password must be at least 8 characters');
                else if (passwordControl.hasError('pattern')) this.passwordError.set('Password must include uppercase, lowercase, number and special character');
                else this.passwordError.set(null);
            }
        });
    }

    login() {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading.set(true);
        this.error.set('');

        const email: string = this.loginForm.value.email ?? '';
        const pass: string = this.loginForm.value.password || '';
        const password: string = pass.slice(0, -3);

        this.auth.login({ email, password })
            .pipe(
                catchError(err => {
                    let msg = 'Login failed';

                    if (err?.error?.error) msg = err.error.error;
                    else if (err?.error?.message) msg = err.error.message;
                    else if (err?.status === 401) msg = 'Unauthorized: Invalid credentials';
                    else if (err?.status === 400) msg = 'Bad request: Check input';
                    else if (err?.status === 403) msg = 'Forbidden: Access denied';

                    this.error.set(msg);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Login failed',
                        detail: msg,
                        life: 3000,
                    });
                    return of(null);
                })
            )
            .subscribe(res => {
                this.loading.set(false);
                if (res?.token) {
                    this.router.navigate(['/dashboard']);
                }
            });
    }

    togglePassword() {
        this.showPassword.set(!this.showPassword());
    }

    get isFormEmpty() {
        const { email, password } = this.loginForm.getRawValue();
        return !email || !password;
    }

}
