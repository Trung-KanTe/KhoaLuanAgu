import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';  // Import AuthService
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isLoggedIn = this.authService.isLoggedIn();  // Kiểm tra qua AuthService

    if (!isLoggedIn) {
      alert('Bạn cần đăng nhập để truy cập trang này!');
      return this.router.createUrlTree(['/login']);
    }

    return true;  // Nếu đã đăng nhập, cho phép truy cập vào route
  }
}
