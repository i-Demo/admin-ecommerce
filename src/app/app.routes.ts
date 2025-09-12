import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    // Auth routes (Use layout)
    {
        path: '',
        loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
        canActivate: [loginGuard],
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
            { path: 'management/product', loadComponent: () => import('./pages/product/product.component').then(m => m.ProductComponent) },
            { path: 'management/orders', loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent) },
            { path: 'management/orders/:id', loadComponent: () => import('./pages/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
            { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
            { path: 'demo', loadComponent: () => import('./pages/demo-page/demo-page.component').then(m => m.DemoPageComponent) },
        ]
    },

    // 404 page
    { path: '**', loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
