import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface User {
  _id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/auth';
  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private hasToken() {
    return !!localStorage.getItem('token');
  }

  private getHeaders() {
    return new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
  }

  register(username: string, password: string, name: string, email: string) {
    return this.http.post(`${this.apiUrl}/register`, {
      username,
      password,
      name,
      email,
      rol: 'user',
    });
  }

  login(username: string, password: string) {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.authState.next(true);
          const payload: any = JSON.parse(atob(response.token.split('.')[1]));
          localStorage.setItem('rol', payload.rol);
        }),
      );
  }

  // 🔹 Obtener usuarios con rol user (solo admin)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, {
      headers: this.getHeaders(),
    });
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
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
