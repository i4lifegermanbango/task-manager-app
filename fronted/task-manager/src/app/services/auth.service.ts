import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private hasToken() {
    return !!localStorage.getItem('token');
  }

  register(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/register`, {
      username,
      password,
    });
  }

  login(username: string, password: string) {
    return this.http
      .post<{
        token: string;
      }>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.authState.next(true);
        }),
      );
  }

  logout() {
    localStorage.removeItem('token');
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return this.authState.asObservable();
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
