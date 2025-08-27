import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../auth.service';
import { catchError, of } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ProgressSpinnerModule, RouterLink, ToastModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    loading = signal(false);
    error = signal('');
    emailError = signal<string | null>(null);
    passwordError = signal<string | null>(null);
    showPassword = signal(false);
    showRePassword = signal(false);

    registerForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        ]],
        repassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    constructor() {
        const emailControl = this.registerForm.get('email');
        emailControl?.valueChanges.subscribe(() => {
            if (emailControl.touched || emailControl.dirty) {
                this.error.set('');
                if (emailControl.hasError('required')) this.emailError.set('Email is required');
                else if (emailControl.hasError('email')) this.emailError.set('Invalid email format');
                else this.emailError.set(null);
            }
        });

        const passwordControl = this.registerForm.get('password');
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

    passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
        const pass = group.get('password')?.value;
        const repass = group.get('repassword')?.value;
        return pass === repass ? null : { passwordMismatch: true };
    }

    togglePassword() {
        this.showPassword.set(!this.showPassword());
    }

    toggleRePassword() {
        this.showRePassword.set(!this.showRePassword());
    }

    get isFormEmpty() {
        const { email, password, repassword } = this.registerForm.getRawValue();
        return !email || !password || !repassword;
    }

    register() {
        this.registerForm.markAllAsTouched();
        if (this.isFormEmpty || this.registerForm.invalid) return;

        this.loading.set(true);
        this.error.set('');

        const email: string = this.registerForm.value.email ?? '';
        const password: string = this.registerForm.value.password || '';

        this.auth.register({ email, password })
            .pipe(
                catchError(err => {
                    console.log(err);
                    
                    let msg = 'Registration failed';
                    if (err?.error?.error) msg = err.error.error;
                    else if (err?.error?.message) msg = err.error.message;
                    else if (err?.status === 400) msg = 'Bad request: Check input';
                    else if (err?.status === 403) msg = 'Forbidden: Access denied';
                    else msg = 'Registration failed';
                    this.error.set(msg);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Register failed',
                        detail: msg,
                        life: 3000
                    });
                    this.loading.set(false);
                    return of(null);
                })
            )
            .subscribe(res => {
                this.loading.set(false);
                if (res?.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Register successfully',
                        detail: 'Registration completed. Please log in.',
                        life: 3000,
                    });
                    this.router.navigate(['/login']);
                }
            });
    }
}
