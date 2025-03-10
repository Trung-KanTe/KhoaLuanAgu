import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss'
})
export class PasswordComponent implements OnInit {

  token: string = '';
  password = { new: '', confirm: '' };
  userId: string = ''; 

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    const decodedToken: any = jwtDecode(this.token); // Sử dụng jwtDecode để giải mã token
    this.userId = decodedToken?.sub || ''; 
  }

  saveResetPassword() {
  
    if (this.password.new !== this.password.confirm) {
      alert('Mật khẩu mới và nhập lại mật khẩu mới không khớp!');
      return;
    }
  
    const requestBody = {
      passwordHash: this.password.confirm
    };
 
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    console.log('Token:', this.token);
    console.log('UserId:', this.userId);
    this.http.put(`/command/api/v1/user/reset-password?id=${this.userId}`, requestBody, { headers })
      .subscribe(
        () => {
          alert('Reset password thành công!');
          this.router.navigate(['/login'])
        },
        (error) => {
          alert('Reset mật khẩu thất bại! Vui lòng thử lại.');
          console.error('Lỗi cập nhật mật khẩu:', error);
        }
      );
  }
}
