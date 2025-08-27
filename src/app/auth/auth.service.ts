import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private tokenKey = 'auth_token';

    login(data: { email: string; password: string }) {
        return this.http.post<any>('https://ng-demo-auth.free.beeceptor.com/api/auth/login', data)
            .pipe(tap(res => res.token && localStorage.setItem(this.tokenKey, res.token)));
    }

    register(data: { email: string; password: string }) {
        return this.http.post<any>('https://ng-demo-auth.free.beeceptor.com/api/auth/register', data);
    }

    logout() { localStorage.removeItem(this.tokenKey); }
    isLoggedIn(): boolean { return !!localStorage.getItem(this.tokenKey); }
}
