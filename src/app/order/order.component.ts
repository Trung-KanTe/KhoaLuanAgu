import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit {
  orders: any[] = [];
  userId: string = ''; // Lấy từ token
  status: string = '';
  currentPage: number = 1; // Biến theo dõi trang hiện tại
  totalPages: number = 2; // Số trang tổng cộng (có thể lấy từ response)
  showDetailModal: boolean = false;  // Trạng thái hiển thị modal
  selectedOrder: any = null; 

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.status = params['status'] || 'all'; // Mặc định là "all"
      this.fetchOrders();
    });
  }

  fetchOrders() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); // Giải mã token
        this.userId = decodedToken?.sub || ''; 
        const apiUrl = `https://localhost:5000/query/api/v1/order/shop/${this.userId}`;
        console.log('UserId:', this.userId);
        this.http.get<{ data: any[] }>(apiUrl).subscribe(response => {
          if (this.status === 'all') {
            this.orders = response.data;
          } else {
            this.orders = response.data.filter(order => order.status === this.status);
          }
        }, error => {
          console.error('Error fetching orders:', error);
        });

      } catch (error) {
        console.error('Lỗi giải mã token:', error);
      }
    } else {
      console.warn('Token không tồn tại trong Local Storage.');
    }
  }

  openDetailModal(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrder = order;  // Gán dữ liệu từ danh sách orders
      this.showDetailModal = true; // Hiển thị modal
    } else {
      console.error('Không tìm thấy đơn hàng với ID:', orderId);
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    const apiUrl = `https://localhost:5000/command/api/v1/order?id=${orderId}`;
    const payload = { status: newStatus };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.put(apiUrl, payload, { headers }).subscribe(
      () => {
        console.log(`Order ${orderId} updated to ${newStatus}`);
        this.orders = this.orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
      },
      error => {
        console.error('Error updating order:', error);
      }
    );
  }
}
