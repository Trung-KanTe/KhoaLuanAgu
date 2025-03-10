import { Component, ChangeDetectorRef  } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgClass, FormsModule, HttpClientModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  
  email: string = '';
  password: string = '';
  isPasswordVisible: boolean = false;
  showModal: boolean = false;
  user = { email: '', tel: ''};

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit(): void {
    const loginData = {
      email: this.email,
      password: this.password
    };

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-version': '1.0',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    this.http.post<{ isSuccess: boolean; data?: { success: boolean; token: string } }>(
      '/command/api/v1/login',
      loginData,
      { headers }
    ).subscribe({
      next: (response) => {
        console.log('LoginData:', loginData);
        console.log('API Response:', response);
        if (response.isSuccess && response.data?.success && response.data.token) {
          localStorage.setItem('token', response.data.token);

          // Decode token to check for roles
          try {
            const decodedToken: any = jwtDecode(response.data.token);
          console.log('Decoded Token:', decodedToken); // In ra để kiểm tra cấu trúc

          // Lấy mảng vai trò từ trường "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          console.log('Roles:', roles);

          // Kiểm tra vai trò cụ thể và chuyển hướng
          if (roles && roles.includes('ADMIN')) {
            this.router.navigate(['/admin']).then(() => this.cdr.detectChanges());;
          } 
          else if (roles && roles.includes('STAFF')) {
            this.router.navigate(['/staff']).then(() => this.cdr.detectChanges());;
          }
          else {
            this.router.navigate(['/']);
          }
          } catch (error) {
            console.error('Token decoding failed:', error);
            alert('Login failed: Invalid token structure');
          }
        } else {
          alert('Login failed: No token received');
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        alert('Email or Password is incorrect!');
      }
    });
  }

  openModal() {
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
    this.user = { email: '', tel: ''}; // Reset dữ liệu khi đóng modal
  }
  
  saveChanges() {   
  
    const requestBody = {
      email: this.user.email,
      tel: this.user.tel
    };
    this.http.post(`/command/api/v1/user/forgot/password`, requestBody )
      .subscribe(
        () => {
          alert('Vui lòng kiểm tra mail để thực hiện các bước tiếp theo! Cảm ơn!');
          this.closeModal();
        },
        (error) => {
          alert('Cập nhật mật khẩu thất bại! Vui lòng thử lại.');
          console.error('Lỗi cập nhật mật khẩu:', error);
        }
      );
  }
}
