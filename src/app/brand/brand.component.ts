import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.scss'
})
export class BrandComponent implements OnInit  {

  brands: { items: Brand[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = []; // Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  brand: any = { name: '', style: '', icon: '' };
  selectedBrand: any = { name: '', style: '', icon: '', views: '', isDeleted: true };
  previewImage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`https://localhost:5000/query/api/v1/brand?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.brands.items = response.data.items;
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

  openUpdateModal(brandId: string) {
    // Tìm brand dựa trên brandId
    const brand = this.brands.items.find(item => item.id === brandId); // Sử dụng this.brands thay vì this.brand
    if (brand) {
      this.selectedBrand = { ...brand };  // Sao chép dữ liệu brand vào selectedBrand để chỉnh sửa
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      // Chuyển đổi file sang Base64
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.brand.icon = this.previewImage;
      };
      
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.brand.name || !this.brand.style || !this.brand.icon) {
      alert('Please fill in all required fields!');
      return;
    }
    const token = localStorage.getItem('token'); 
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
    const apiUrl = '/command/api/v1/brand';
    this.http.post(apiUrl, this.brand, { headers }).subscribe(
      response => {
        alert('Brand added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
      },
      error => {
        alert('Error adding brand. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
    if (!this.selectedBrand.icon || this.selectedBrand.icon.trim() === '' || !isValidBase64(this.selectedBrand.icon)) {
      this.selectedBrand.icon = null;
    }
    const isDeletedValue = this.selectedBrand.isDeleted !== undefined ? this.selectedBrand.isDeleted : true; // default true if not selected
    this.selectedBrand.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedBrand.isDeleted);
    console.log('Selected Brand Icon:', this.selectedBrand.icon);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const brandId = this.selectedBrand.id; // Get the brandId from the selectedBrand object
    const apiUrl = `/command/api/v1/brand?id=${brandId}`;  // Use brandId in API request
    console.log('Selected Brand:', this.selectedBrand);
    this.http.put(apiUrl, this.selectedBrand, { headers }).subscribe(
      response => {
        alert('Brand updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected Brand:', this.selectedBrand);
      },
      error => {
        alert('Error updating brand. Please try again.');
      }
    );
  }


  deleteBrand(brandId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/brand?id=${brandId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('Brand deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting brand. Please try again.');
        }
    );
}
}

interface Brand {
  id: string;
  name: string;
  style: string;
  icon: string;
  views: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
};

function isValidBase64(str: string): boolean {
  const base64Regex = /^data:image\/(jpeg|png|gif|webp);base64,/i;
  return base64Regex.test(str);
}