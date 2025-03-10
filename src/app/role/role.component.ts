import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss'
})
export class RoleComponent implements OnInit  {

  roles: { items: Role[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = []; // Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  role: any = { name: '', description: '' };
  selectedRole: any = { name: '', description: '', isDeleted: true };
  previewImage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`https://localhost:5000/query/api/v1/role/paging?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.roles.items = response.data.items;
      this.currentPage = pageNumber; // Cập nhật trang hiện tại
      this.totalPages = response.data.totalPages; // Cập nhật tổng số trang từ response (nếu có)
      this.updatePagination(); // Cập nhật danh sách số trang
    });
}

// Hàm cập nhật danh sách số trang
updatePagination(): void {
  this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openUpdateModal(roleId: string) {
    // Tìm role dựa trên roleId
    const role = this.roles.items.find(item => item.id === roleId); // Sử dụng this.roles thay vì this.role
    if (role) {
      this.selectedRole = { ...role };  // Sao chép dữ liệu role vào selectedRole để chỉnh sửa
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  saveChanges() {
    if (!this.role.name || !this.role.description) {
      alert('Please fill in all required fields!');
      return;
    }
    const token = localStorage.getItem('token'); 
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
    const apiUrl = '/command/api/v1/role';
    this.http.post(apiUrl, this.role, { headers }).subscribe(
      response => {
        alert('Role added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
      },
      error => {
        alert('Error adding role. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
    const isDeletedValue = this.selectedRole.isDeleted !== undefined ? this.selectedRole.isDeleted : true; // default true if not selected
    this.selectedRole.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedRole.isDeleted);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const roleId = this.selectedRole.id; // Get the roleId from the selectedRole object
    const apiUrl = `/command/api/v1/role?id=${roleId}`;  // Use roleId in API request
    console.log('Selected Role:', this.selectedRole);
    this.http.put(apiUrl, this.selectedRole, { headers }).subscribe(
      response => {
        alert('Role updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected Role:', this.selectedRole);
      },
      error => {
        alert('Error updating role. Please try again.');
      }
    );
  }


  deleteRole(roleId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/role?id=${roleId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('Role deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting role. Please try again.');
        }
    );
}
}

interface Role {
  id: string;
  name: string;
  description: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
};