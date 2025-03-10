import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit  {

  stores: { items: Store[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = []; // Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  store: any = { name: '', image: '', description: '', tel: '', email: '', website: '', style: '', address: '', views: '', insertedAt:'' };
  selectedStore: any = { name: '', image: '', description: '', tel: '', email: '', website: '', style: '', views: '', address: '', isDeleted: true, insertedAt:'' };
  previewImage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`https://localhost:5000/query/api/v1/shop/paging?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.stores.items = response.data.items;
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

  openUpdateModal(storeId: string) {
    // Tìm store dựa trên storeId
    const store = this.stores.items.find(item => item.id === storeId); // Sử dụng this.stores thay vì this.store
    if (store) {
      this.selectedStore = { ...store };  // Sao chép dữ liệu store vào selectedStore để chỉnh sửa
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  openDetailModal(storeId: string) {
    // Tìm store dựa trên storeId
    const store = this.stores.items.find(item => item.id === storeId); // Sử dụng this.stores thay vì this.store
    if (store) {
      this.selectedStore = { ...store };  // Sao chép dữ liệu store vào selectedStore để chỉnh sửa
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
        this.store.image = this.previewImage;
      };
      
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.store.name || !this.store.description || !this.store.image || !this.store.tel || !this.store.email || !this.store.website || !this.store.style || !this.store.address) {
      alert('Please fill in all required fields!');
      return;
    }
    const token = localStorage.getItem('token');
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
    const apiUrl = `/command/api/v1/shop`;
    this.http.post(apiUrl, this.store, { headers }).subscribe(
      response => {
        alert('Store added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
      },
      error => {
        console.error('Error:', error);
        alert('Error adding store. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
    if (!this.selectedStore.image || this.selectedStore.image.trim() === '' || !isValidBase64(this.selectedStore.image)) {
      this.selectedStore.image = null;
    }
    const isDeletedValue = this.selectedStore.isDeleted !== undefined ? this.selectedStore.isDeleted : true; // default true if not selected
    this.selectedStore.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedStore.isDeleted);
    console.log('Selected Store Icon:', this.selectedStore.image);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const storeId = this.selectedStore.id; // Get the storeId from the selectedStore object
    const apiUrl = `/command/api/v1/shop?id=${storeId}`;  // Use storeId in API request
    console.log('Selected Store:', this.selectedStore);
    this.http.put(apiUrl, this.selectedStore, { headers }).subscribe(
      response => {
        alert('Store updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected Store:', this.selectedStore);
      },
      error => {
        alert('Error updating store. Please try again.');
      }
    );
  }


  deleteStore(storeId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/shop?id=${storeId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('Store deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting store. Please try again.');
        }
    );
}
}

interface Store {
  id: string;
  name: string;
  style: string;
  image: string;
  description: string;
  tel: string;
  address: string;
  email: string;
  website: string;
  views: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
};

function isValidBase64(str: string): boolean {
  const base64Regex = /^data:image\/(jpeg|png|gif|webp);base64,/i;
  return base64Regex.test(str);
}