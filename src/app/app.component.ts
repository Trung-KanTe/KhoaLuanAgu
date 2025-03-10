import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, RouterOutlet, RouterModule, RouterLink, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    JwtHelperService,
    {
      provide: JWT_OPTIONS,
      useValue: {
        tokenGetter: () => (typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('access_token') : null),
        allowedDomains: ['example.com'],
        disallowedRoutes: ['example.com/api/auth']
      }
    }
  ]
})
export class AppComponent implements OnInit {
  cart: any = {};
  userId: string = ''; 
  title = 'grpc-angular-app';
  isAdmin: boolean = false;
  isStaff: boolean = false;
  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.checkTokenExpiration();
    this.cdr.detectChanges();
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); // Sử dụng jwtDecode để giải mã token
        this.userId = decodedToken?.sub || ''; 
        const roles = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const roleArray = Array.isArray(roles) ? roles : [roles]; // Đảm bảo luôn là mảng
        this.isAdmin = roleArray.includes('ADMIN');
        this.isStaff = roleArray.includes('STAFF');
        this.cdr.detectChanges();
        console.log('Roles:', roles);
      } catch (error) {
        console.error('Lỗi giải mã token:', error);
        this.userId = ''; 
        this.isAdmin = false;
        this.isStaff = false;
      }
    } else {
      console.warn('Token không tồn tại trong Local Storage.');
      this.userId = '';
      this.isAdmin = false;
      this.isStaff = false;
      this.cdr.detectChanges();
    }
  
    // Kiểm tra nếu userId đã có thì gọi API lấy giỏ hàng
    if (this.userId) {
      this.cdr.detectChanges();
      this.getCart();
    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && this.userId) {
        this.cdr.detectChanges();
        this.getCart();
      }
    }); 
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.clear(); 
    this.cart = {};  
    this.userId = ''; 
    this.cdr.detectChanges(); 
    this.router.navigate(['/login']);
  }

  checkTokenExpiration() {
    const token = localStorage.getItem('token');
    if (token && this.jwtHelper.isTokenExpired(token)) {
      alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      this.cdr.detectChanges();
    }
  }

  checkLogin(event: Event, path: string, id?: string) {
    event.preventDefault();
    console.log('UserId (tham số):', id);
  
    const token = localStorage.getItem('token');
    if (token) {
      const userId = this.getUserIdFromToken(token);
      if (userId) {
        localStorage.setItem('userId', userId); 
        console.log('UserId lưu vào localStorage:', userId);
        this.router.navigate([path], { queryParams: { id: userId } });
        this.http.get(`/query/api/v1/cart/${this.userId}`).subscribe({
          next: (response: any) => {
            if (response && response.data) {
              this.cart = response.data[0];
              console.log('Cart data:', this.cart);
              console.log('UserId:', this.userId);
              this.cdr.detectChanges();
            }
          },
          error: (error) => {
            console.error('Error fetching cart:', error);
            alert('Lỗi khi tải giỏ hàng: ' + (error.message || 'Có lỗi xảy ra.'));
          }
        });
      }
    } else {
      alert('Bạn cần đăng nhập để tiếp tục!');
      this.router.navigate(['/login']);
    }
  }

  getCart(): void {
    if (!this.userId) {
      console.warn('Không có userId để lấy giỏ hàng');
      return;
    }
  
    this.http.get(`/query/api/v1/cart/${this.userId}`).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.cart = response.data;
          console.log('Cart data:', this.cart);
          console.log('UserId:', this.userId);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error fetching cart:', error);
        alert('Lỗi khi tải giỏ hàng: ' + (error.message || 'Có lỗi xảy ra.'));
      }
    });
  }


  getUserIdFromToken(token: string): string | null {
    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      console.log('Decoded Token:', decodedToken);
      return decodedToken?.sub || null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }
  
}
