import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.scss'
})
export class PurchaseComponent {
  orders: any[] = []; // Danh sách tất cả đơn hàng
  filteredOrders: any[] = []; // Danh sách đơn hàng sau khi lọc
  selectedStatus: string = ''; // Trạng thái đang được chọn
  showModal: boolean = false;
  showModalReview: boolean = false;
  productReview = { productId: '', userId: '', rating: 0, comment: '', image: '' as string | null };
  orderCancel = { orderId: '', reason: '' }; // Lưu dữ liệu hủy đơn hàng
  previewImage: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadOrders(); // Gọi khi component khởi tạo
  }

  // Tải danh sách đơn hàng
  private loadOrders(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) return;

    this.http.get(`/query/api/v1/order/${userId}`).subscribe((response: any) => {
      this.orders = response.data;
      this.applyFilter(); // Áp dụng bộ lọc ngay khi có dữ liệu
    });
  }

  // Lọc danh sách đơn hàng dựa trên trạng thái
  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredOrders = this.selectedStatus === '' || this.selectedStatus === 'all' 
      ? this.orders 
      : this.orders.filter(order => order.status.toLowerCase() === this.selectedStatus.toLowerCase());
  }

  // Xử lý khi nhấn nút hành động
  onActionClick(order: any): void {
    if (order.status === 'pending') {
      this.openModal(order); // Mở modal nhập lý do hủy đơn
    } else if (order.status === 'confirmed') {
      this.updateOrderStatus(order.id, 'completed'); // Nhấn "Received" thì cập nhật thành "completed"
    }
  }

  // Hiển thị modal hủy đơn
  openModal(order: any) {
    this.orderCancel.orderId = order.id;
    this.orderCancel.reason = ''; // Reset lý do khi mở modal
    this.showModal = true;
  }

  // Đóng modal
  closeModal() {
    this.showModal = false;
  }

  saveChanges() {
    if (!this.orderCancel || !this.orderCancel.orderId || !this.orderCancel.reason) {
      alert('Please enter a reason for cancellation.');
      return;
    }
  
    const apiUrlCancel = '/command/api/v1/orderCancel';
    console.log('Order Cancel data:', this.orderCancel);
  
    this.http.post(apiUrlCancel, this.orderCancel, { headers: this.getHeaders() }).subscribe({
      next: () => {
        console.log('Order canceled successfully!');
  
        // Gọi API cập nhật trạng thái đơn hàng thành "canceled"
        this.updateOrderStatus(this.orderCancel.orderId, 'canceled');
  
        this.closeModal();
        this.loadOrders(); // Load lại danh sách đơn hàng sau khi hủy
      },
      error: () => {
        alert('Error canceling order. Please try again.');
      }
    });
  }
  
  // Cập nhật trạng thái đơn hàng thành "canceled"
  private updateOrderStatus(orderId: string, status: string): void {
    const apiUrl = `/command/api/v1/order?id=${orderId}`;
    const requestBody = { status }; // Cập nhật trạng thái linh hoạt
  
    this.http.put(apiUrl, requestBody, { headers: this.getHeaders() }).subscribe({
      next: () => {
        console.log(`Order status updated to ${status} successfully!`);
        this.loadOrders(); // Load lại danh sách đơn hàng sau khi cập nhật
      },
      error: (error) => console.error(`Failed to update order status to ${status}:`, error)
    });
  }

  onReviewClick(order: any): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) return;
  
    console.log('Mở modal đánh giá cho đơn hàng:', order);
  
    if (order.orderItems.length > 0) {
      this.productReview.productId = order.orderItems[0].productId;
    } else {
      console.warn('Đơn hàng không có sản phẩm nào!');
      return;
    }
  
    this.productReview.userId = userId;
    this.showModalReview = true;
  }

  closeModalReview(): void {
    this.showModalReview = false;
  }
  
  // Chọn số sao
  setRating(star: number): void {
    this.productReview.rating = star;
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
  
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.productReview.image = this.previewImage; // Gán giá trị hình ảnh
      };
  
      reader.readAsDataURL(file);
    } else {
      this.previewImage = null;
      this.productReview.image = null; // Nếu không có hình ảnh, đặt giá trị null
    }
  }
  
  // Gửi dữ liệu lên API
  saveChangesReview(): void {
    if (!this.productReview.comment || this.productReview.rating === 0) {
      alert('Vui lòng nhập bình luận và chọn số sao!');
      return;
    }
  
    if (!this.previewImage) {
      this.productReview.image = null;
    }
    const apiUrl = '/command/api/v1/productReview'; // Đường dẫn API
    console.log('Gửi đánh giá:', this.productReview);
  
    this.http.post(apiUrl, this.productReview, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        console.log('Phản hồi từ server:', response);
        alert('Đánh giá đã được gửi!');
        this.closeModalReview();
      },
      error: (error) => {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!');
      }
    });
  }

  // Lấy headers (tránh lặp code)
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
}

function isValidBase64(str: string): boolean {
  const base64Regex = /^data:image\/(jpeg|png|gif|webp);base64,/i;
  return base64Regex.test(str);
}