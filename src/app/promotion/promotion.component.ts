import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotion.component.html',
  styleUrl: './promotion.component.scss'
})
export class PromotionComponent implements OnInit  {

  promotions: { items: Promotion[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = [];// Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  promotion: any = { name: '', description: '', discountCode: '', discountValue: '', startDate: '', endDate: '', insertedAt:'' };
  selectedPromotion: any = { name: '', description: '', discountCode: '', discountValue: '', startDate: '', endDate: '', isDeleted: true, insertedAt:'' };
  previewImage: string | null = null;
  formatPrice(event: any) {
    let inputValue = event.target.value;
  
    // Loại bỏ mọi ký tự không phải số
    inputValue = inputValue.replace(/\D/g, '');
  
    // Định dạng giá trị với dấu phân cách hàng nghìn
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
    // Cập nhật giá trị với định dạng
    this.promotion.discountValue = formattedValue;
    this.selectedPromotion.discountValue = formattedValue;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`https://localhost:5000/query/api/v1/promotion/paging?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.promotions.items = response.data.items;
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

  openUpdateModal(promotionId: string) {
    // Tìm promotion dựa trên promotionId
    const promotion = this.promotions.items.find(item => item.id === promotionId); // Sử dụng this.promotions thay vì this.promotion
    if (promotion) {
      this.selectedPromotion = { ...promotion };  // Sao chép dữ liệu promotion vào selectedPromotion để chỉnh sửa
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  openDetailModal(promotionId: string) {
    // Tìm promotion dựa trên promotionId
    const promotion = this.promotions.items.find(item => item.id === promotionId); // Sử dụng this.promotions thay vì this.promotion
    if (promotion) {
      this.selectedPromotion = { ...promotion };  // Sao chép dữ liệu promotion vào selectedPromotion để chỉnh sửa
      this.showDetailModal = true;
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
  }


  saveChanges() {
    if (!this.promotion.name || !this.promotion.description || !this.promotion.discountCode || !this.promotion.discountValue || !this.promotion.startDate || !this.promotion.endDate) {
      alert('Please fill in all required fields!');
      return;
    }
    const token = localStorage.getItem('token');
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
    const apiUrl = `/command/api/v1/promotion`;
    this.http.post(apiUrl, this.promotion, { headers }).subscribe(
      response => {
        alert('Promotion added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
      },
      error => {
        console.error('Error:', error);
        alert('Error adding promotion. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
    
    const isDeletedValue = this.selectedPromotion.isDeleted !== undefined ? this.selectedPromotion.isDeleted : true; // default true if not selected
    this.selectedPromotion.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedPromotion.isDeleted);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const promotionId = this.selectedPromotion.id; // Get the promotionId from the selectedPromotion object
    const apiUrl = `/command/api/v1/promotion?id=${promotionId}`;  // Use promotionId in API request
    console.log('Selected Promotion:', this.selectedPromotion);
    this.http.put(apiUrl, this.selectedPromotion, { headers }).subscribe(
      response => {
        alert('Promotion updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected Promotion:', this.selectedPromotion);
      },
      error => {
        alert('Error updating promotion. Please try again.');
      }
    );
  }


  deletePromotion(promotionId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/promotion?id=${promotionId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('Promotion deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting promotion. Please try again.');
        }
    );
}
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  endDate: string;
  startDate: string;
  discountValue: string;
  discountCode: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
};
