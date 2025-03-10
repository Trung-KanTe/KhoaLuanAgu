import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private token: string | null = localStorage.getItem('token'); // Kiểm tra token trong localStorage

  constructor() {
    // Kiểm tra khi ứng dụng được khởi động lại
    if (this.token) {
      this.isLoggedInSubject.next(true);  // Người dùng đã đăng nhập nếu có token
      this.isAdminSubject.next(this.checkIfAdmin());  // Kiểm tra xem người dùng có phải là admin không
    }
  }

  // Kiểm tra trạng thái đăng nhập
  isLoggedIn(): boolean {
    return !!this.token;  // Trả về true nếu có token, false nếu không
  }

  // Lấy trạng thái đăng nhập
  get isLoggedIn$() {
    return this.isLoggedInSubject.asObservable();
  }

  // Kiểm tra xem người dùng có phải là admin không (dựa trên token hoặc dữ liệu khác)
  checkIfAdmin(): boolean {
    // Giả sử nếu token chứa 'admin' thì người dùng là admin
    return this.token?.includes('admin') ?? false;
  }

  // Lấy trạng thái quyền admin
  get isAdmin$() {
    return this.isAdminSubject.asObservable();
  }

  // Đăng nhập
  login(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
    this.isAdminSubject.next(this.checkIfAdmin());  // Cập nhật quyền admin
  }

  // Đăng xuất
  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.isAdminSubject.next(false);  // Cập nhật lại trạng thái admin khi đăng xuất
  }
}
