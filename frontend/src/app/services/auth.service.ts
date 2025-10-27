import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'mcd_token';
  private USER_KEY = 'mcd_user';

  constructor(private api: ApiService, private router: Router) {}

  register(data: { name: string; email: string; password: string }): Observable<LoginResponse> {
    return this.api.register(data).pipe(tap((res) => this.persistSession(res)));
  }
  login(data: { email: string; password: string }): Observable<LoginResponse> {
    return this.api.login(data).pipe(tap((res) => this.persistSession(res)));
  }

  updateMe(name: string) {
    return this.api.updateMe({ name }).pipe(
      tap((user) => localStorage.setItem(this.USER_KEY, JSON.stringify(user)))
    );
  }

  private persistSession(res: LoginResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth']);
  }

  isLoggedIn(): boolean { return !!this.getToken(); }
  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  getUser(): { id: string; name: string; email: string } | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
