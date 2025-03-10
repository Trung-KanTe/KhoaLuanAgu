import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  user: any = {}; 
  selectedUser: any = {}; // Biến để binding dữ liệu trong modal
  showUpdateModal: boolean = false;
  showPasswordModal: boolean = false;
  showSecurityOptions: boolean = false;
  password = { current: '', new: '', confirm: '' };
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadProvinces(); // Load danh sách tỉnh/thành phố khi component khởi tạo
  }

  private loadUser(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) return;

    this.http.get(`/query/api/v1/user/${userId}`).subscribe((response: any) => {
      if (response && response.data) {
        this.user = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          tel: response.data.tel,
          address: response.data.address,
          province: {
            id: response.data.wards?.district?.province?.id || '',
            name: response.data.wards?.district?.province?.name || '',
            fullName: response.data.wards?.district?.province?.fullName || ''
          },
          district: {
            id: response.data.wards?.district?.id || '',
            name: response.data.wards?.district?.name || '',
            fullName: response.data.wards?.district?.fullName || ''
          },
          ward: {
            id: response.data.wards?.id || '',
            name: response.data.wards?.name || '',
            fullName: response.data.wards?.fullName || ''
          }
        };
      }
    });
  }

  toggleSecurityOptions() { this.showSecurityOptions = !this.showSecurityOptions; }

  private loadProvinces(): void {
    this.http.get('/query/api/v1/province').subscribe((response: any) => {
      this.provinces = response.data;
    });
  }

  onProvinceChange() {
    this.selectedUser.district = ''; // Xóa dữ liệu District hiện tại
    this.selectedUser.ward = ''; // Xóa dữ liệu Ward hiện tại
    this.districts = [];
    this.wards = [];
    console.log('Selected province:', this.selectedUser.province);
    if (this.selectedUser.province) {
      this.http.get(`/query/api/v1/district/${this.selectedUser.province}`)
        .subscribe((response: any) => {
          this.districts = response.data;
        });
    }
  }

  onDistrictChange() {
    this.selectedUser.ward = ''; // Xóa dữ liệu Ward hiện tại
    this.wards = [];
  
    if (this.selectedUser.district) {
      this.http.get(`/query/api/v1/ward/district/${this.selectedUser.district}`)
        .subscribe((response: any) => {
          this.wards = response.data;
        });
    }
  }

  openUpdateModal() {
    this.selectedUser = { ...this.user }; // Sao chép dữ liệu user vào selectedUser
    this.showUpdateModal = true;
  
    // Gán lại province từ danh sách đã có
    this.selectedUser.province = this.provinces.find(p => p.id === this.selectedUser.province.id) || null;
  
    // Load danh sách districts nếu province đã có dữ liệu
    if (this.selectedUser.province?.id) {
      this.http.get(`/query/api/v1/district/${this.selectedUser.province.id}`)
        .subscribe((response: any) => {
          this.districts = response.data;
  
          // Gán lại district dựa vào danh sách mới lấy về
          this.selectedUser.district = this.districts.find(d => d.id === this.selectedUser.district.id) || null;
  
          // Load danh sách wards nếu district đã có dữ liệu
          if (this.selectedUser.district?.id) {
            this.http.get(`/query/api/v1/ward/district/${this.selectedUser.district.id}`)
              .subscribe((wardResponse: any) => {
                this.wards = wardResponse.data;
  
                // Gán lại ward dựa vào danh sách mới lấy về
                this.selectedUser.ward = this.wards.find(w => w.id === this.selectedUser.ward.id) || null;
              });
          }
        });
    }
  }

  logout(): void {
    localStorage.clear(); 
    this.cdr.detectChanges(); 
    this.router.navigate(['/login']);
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  saveUpdateChanges() {
    const wardId = this.selectedUser.ward ? Number(this.selectedUser.ward) : null;

    const updatedUser = {
      ...this.selectedUser, // Sao chép toàn bộ dữ liệu từ selectedUser
      wardId: wardId, // Thêm wardId vào object
    };
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log('Selected user:', updatedUser);
    this.http.put(`/command/api/v1/user/profile?id=${this.selectedUser.id}`, updatedUser, { headers })
      .subscribe(() => {
        this.loadUser();
        this.closeUpdateModal();
      });
  }

  openPasswordModal() {
    this.showPasswordModal = true;
  }
  
  closePasswordModal() {
    this.showPasswordModal = false;
    this.password = { current: '', new: '', confirm: '' }; // Reset dữ liệu khi đóng modal
  }
  
  saveUpdateChangesPassword() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) return;
    if (!this.password.current || !this.password.new || !this.password.confirm) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
  
    if (this.password.new !== this.password.confirm) {
      alert('Mật khẩu mới và nhập lại mật khẩu mới không khớp!');
      return;
    }
  
    const requestBody = {
      oldPasswordHash: this.password.current,
      newPasswordHash: this.password.new
    };
  
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log('Selected userId:', userId);
    this.http.put(`/command/api/v1/user/password?id=${userId}`, requestBody, { headers })
      .subscribe(
        () => {
          alert('Mật khẩu đã được cập nhật thành công!');
          this.closePasswordModal();
        },
        (error) => {
          alert('Cập nhật mật khẩu thất bại! Vui lòng thử lại.');
          console.error('Lỗi cập nhật mật khẩu:', error);
        }
      );
  }
}