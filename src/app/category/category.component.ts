import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit  {

  categorys: { items: Category[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = []; // Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  category: any = { name: '', style: '', image: '', classificationIds: [] };
  selectedCategory: any = { name: '', style: '', image: '', views: '', isDeleted: true, classificationIds: [] };
  previewImage: string | null = null;
  classifications: any[] = [];
  selectedClassifications: string[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
    this.loadClassifications();
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`https://localhost:5000/query/api/v1/category?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.categorys.items = response.data.items;
      this.currentPage = pageNumber; // Cập nhật trang hiện tại
      this.totalPages = response.data.totalPages; // Cập nhật tổng số trang từ response (nếu có)
      this.updatePagination(); // Cập nhật danh sách số trang
    });
}

// Hàm cập nhật danh sách số trang
updatePagination(): void {
  this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

  loadClassifications() {
    this.http.get('https://localhost:5000/query/api/v1/classification/name').subscribe((response: any) => {
      this.classifications = response.data; // Lưu dữ liệu phân loại vào biến classifications
    });
  }

  toggleClassificationSelection(classificationId: string, event: any): void {
    if (event.target.checked) {
      this.category.classificationIds.push(classificationId);
      this.selectedCategory.classificationIds.push(classificationId);
    } else {
      this.category.classificationIds = this.category.classificationIds.filter((id: string) => id !== classificationId);
      this.selectedCategory.classificationIds = this.selectedCategory.classificationIds.filter((id: string) => id !== classificationId);
    }
    console.log('Updated selectedCategory classifications:', this.selectedCategory.classificationIds);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openUpdateModal(categoryId: string) {
    // Tìm category dựa trên categoryId
    const category = this.categorys.items.find(item => item.id === categoryId); // Sử dụng this.categorys thay vì this.category
    if (category) {
      this.selectedCategory = { ...category };  // Sao chép dữ liệu category vào selectedCategory để chỉnh sửa
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  openDetailModal(storeId: string) {
    // Tìm store dựa trên storeId
    const store = this.categorys.items.find(item => item.id === storeId); // Sử dụng this.stores thay vì this.store
    if (store) {
      this.selectedCategory = { ...store };  // Sao chép dữ liệu store vào selectedStore để chỉnh sửa
      this.showDetailModal = true;
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      // Chuyển đổi file sang Base64
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.category.image = this.previewImage;
        this.selectedCategory.image = this.previewImage; // Gán giá trị mới cho image khi chọn ảnh
        console.log('Icon Base64:', this.selectedCategory.image);
        this.cdr.detectChanges();
      };
      
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.category.name || !this.category.style || !this.category.image) {
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
    const apiUrl = '/command/api/v1/category';
    this.http.post(apiUrl, this.category, { headers }).subscribe(
      response => {
        alert('Category added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
        this.cdr.detectChanges();
      },
      error => {
        alert('Error adding category. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
    if (!this.selectedCategory.image || this.selectedCategory.image.trim() === '' || !isValidBase64(this.selectedCategory.image)) {
      this.selectedCategory.image = null;
    }
    const isDeletedValue = this.selectedCategory.isDeleted !== undefined ? this.selectedCategory.isDeleted : true; // default true if not selected
    this.selectedCategory.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedCategory.isDeleted);
    console.log('Selected Category Icon:', this.selectedCategory.image);
    console.log('Selected classification:', this.selectedCategory.classificationIds);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  
    const categoryId = this.selectedCategory.id; // Get the categoryId from the selectedCategory object
    const apiUrl = `/command/api/v1/category?id=${categoryId}`;  // Use categoryId in API request
    this.http.put(apiUrl, this.selectedCategory, { headers }).subscribe(
      response => {
        alert('Category updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected Category:', this.selectedCategory);
        this.cdr.detectChanges();
      },
      error => {
        alert('Error updating category. Please try again.');
      }
    );
  }

  getClassificationNameFromList(classificationId: string): string {
    const classification = this.classifications.find(c => c.id === classificationId);
    return classification ? classification.name : 'Unknown'; // Nếu không tìm thấy, trả về 'Unknown'
  }


  deleteCategory(categoryId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/category?id=${categoryId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('Category deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting category. Please try again.');
        }
    );
}
}

interface Classification {
  name: string;
  icon: string;
  style: string;
  views: number;
  insertedAt: string;
  updatedAt: string;
  isDeleted: boolean;
  id: string;
}

interface Category {
  id: string;
  name: string;
  style: string;
  image: string;
  views: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
  classifications: Classification[];   // Thêm thuộc tính classifications
}

function isValidBase64(str: string): boolean {
  const base64Regex = /^data:image\/(jpeg|png|gif|webp);base64,/i;
  return base64Regex.test(str);
}

