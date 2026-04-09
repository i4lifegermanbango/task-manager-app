import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const tokenExpired = tokenPayload.exp * 1000 < Date.now();

      if (tokenExpired) {
        return false;
      }
    } catch (error) {
      this.authService.logout();
      return false;
    }

    return true;
  }
}
