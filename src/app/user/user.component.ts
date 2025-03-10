import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit  {

  users: { items: User[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = [];// Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  user: any = { name: '', email: '', tel: '', address: '', wardId: '', insertedAt: '', isDeleted: true, roleIds: [] };
  selectedUser: any = { name: '', email: '', tel: '', address: '', wardId: '', insertedAt: '', isDeleted: true, roleIds: []};
  roles: any[] = [];
  selectedRoles: string[] = [];
  wards: any[] = [];
  provinces: any[] = [];
  districts: any[] = [];
  selectedWard: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
    this.loadRoles();
    this.loadProvinces();
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`https://localhost:5000/query/api/v1/user/localization?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.users.items = response.data.items;
      this.currentPage = pageNumber; // Cập nhật trang hiện tại
      this.totalPages = response.data.totalPages; // Cập nhật tổng số trang từ response (nếu có)
      this.updatePagination(); // Cập nhật danh sách số trang
    });
}

// Hàm cập nhật danh sách số trang
updatePagination(): void {
  this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

  loadRoles() {
    this.http.get('https://localhost:5000/query/api/v1/role').subscribe((response: any) => {
      this.roles = response.data; // Lưu dữ liệu phân loại vào biến roles
    });
  }

  private loadProvinces(): void {
    this.http.get('/query/api/v1/province').subscribe((response: any) => {
      this.provinces = response.data;
    });
  }

  onProvinceChange() {
    if (this.user.province) {
      this.http.get(`/query/api/v1/district/${this.user.province}`)
        .subscribe((response: any) => {
          this.districts = response.data;
          this.user.district = ''; // Reset khi chọn Province mới
          this.wards = []; // Reset Wards
        });
    }
  }

  onDistrictChange() {
    if (this.user.district) {
      this.http.get(`/query/api/v1/ward/district/${this.user.district}`)
        .subscribe((response: any) => {
          this.wards = response.data;
          this.user.ward = ''; // Reset khi chọn District mới
        });
    }
  }

  toggleRoleSelection(roleId: string, event: any): void {
    // Kiểm tra và khởi tạo roleIds nếu chưa có
    if (!this.user.roleIds) {
      this.user.roleIds = [];
    }
    if (!this.selectedUser.roleIds) {
      this.selectedUser.roleIds = [];
    }
  
    // Xử lý thêm hoặc xóa role
    if (event.target.checked) {
      this.user.roleIds.push(roleId);
      this.selectedUser.roleIds.push(roleId);
    } else {
      this.user.roleIds = this.user.roleIds.filter((id: string) => id !== roleId);
      this.selectedUser.roleIds = this.selectedUser.roleIds.filter((id: string) => id !== roleId);
    }
  
    console.log('Updated selectedUser roles:', this.selectedUser.roleIds);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openUpdateModal(userId: string) {
    const user = this.users.items.find(item => item.id === userId);
    if (user) {
        this.selectedUser = { ...user };
        console.log('User được load:', this.selectedUser); // Kiểm tra dữ liệu có đúng không
        this.selectedRoles = user.roles?.map((role: any) => role.id) || [];
        
        // Kiểm tra ward, district, province
        console.log('Ward:', user.wards);
        console.log('District:', user.wards?.district);
        console.log('Province:', user.wards?.province);

        this.selectedUser.province = user.wards?.province;
        this.selectedUser.district = user.wards?.district;
        this.selectedUser.ward = user.wards;

        this.showUpdateModal = true;
    } else {
        console.log('Không tìm thấy user với ID:', userId);
    }
}

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  openDetailModal(storeId: string) {
    const store = this.users.items.find(item => item.id === storeId); // Sử dụng this.stores thay vì this.store
    if (store) {
      this.selectedUser = { ...store };  // Sao chép dữ liệu store vào selectedStore để chỉnh sửa
      this.showDetailModal = true;
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
  }

  saveChanges() {
    if (!this.user.name || !this.user.email || !this.user.tel) {
      alert('Please fill in all required fields!');
      return;
    }
    const token = localStorage.getItem('token'); 
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
    this.user.wardId = this.user.ward;
    const apiUrl = '/command/api/v1/user';
    console.log('User data:', this.user);
    this.http.post(apiUrl, this.user, { headers }).subscribe(
      response => {
        alert('User added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
        this.cdr.detectChanges();
      },
      error => {
        alert('Error adding user. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    const isDeletedValue = this.selectedUser.isDeleted !== undefined ? this.selectedUser.isDeleted : true; // default true if not selected
    this.selectedUser.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedUser.isDeleted);
    console.log('Selected role:', this.selectedUser.roleIds);

    const updateUserData = {
      name: this.selectedUser.name,
      email: this.selectedUser.email,
      passwordHash: this.selectedUser.passwordHash,
      tel: this.selectedUser.tel,
      wardId: this.selectedUser.ward.id,  
      isDeleted: this.selectedUser.isDeleted !== undefined ? this.selectedUser.isDeleted : true , // Kiểm tra và gán giá trị isDeleted
      roleId: this.selectedUser.roleIds  
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  
    const userId = this.selectedUser.id; // Get the userId from the selectedUser object
    const apiUrl = `/command/api/v1/user?id=${userId}`;  // Use userId in API request
    console.log('Selected UpdateData:', updateUserData);
    this.http.put(apiUrl, updateUserData, { headers }).subscribe(
      response => {
        alert('User updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected User:', this.selectedUser);
        this.cdr.detectChanges();
      },
      error => {
        alert('Error updating user. Please try again.');
      }
    );
  }

  getRoleNameFromList(roleId: string): string {
    const role = this.roles.find(c => c.id === roleId);
    return role ? role.name : 'Unknown'; // Nếu không tìm thấy, trả về 'Unknown'
  }


  deleteUser(userId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/user?id=${userId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('User deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting user. Please try again.');
        }
    );
}
}

interface Role {
  name: string;
  description: string;
  isDeleted: boolean;
  id: string;
}

interface Ward {
  id: string;
  name: string;
  district: { id: string; name: string };
  province: { id: string; name: string };
}

interface User {
  id: string;
  name: string;
  email: string;
  tel: string;
  wardId: string;
  address: string;
  passwordHash: string;
  status: boolean;
  insertedAt: string;
  isDeleted: boolean;
  roles: Role[];
  wards?: Ward;  // Thêm dòng này
}

