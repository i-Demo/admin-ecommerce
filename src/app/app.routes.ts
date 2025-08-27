import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    // Auth routes (Use layout)
    {
        path: '',
        loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
        children: [
            { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
            { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
        ]
    },

    // App routes (Don't use layout)
    {
        path: '',
        loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            // { path: 'tasks', loadComponent: () => import('./pages/task-list/task-list.component').then(m => m.TaskListComponent) },
            // { path: 'forms', loadComponent: () => import('./pages/forms/forms.component').then(m => m.FormsComponent) },
        ]
    },

    // 404 page
    { path: '**', loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
