import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  selectedPaymentMethod: string = '';
  receiptData: any;
  userId: string = ''; 
  user: any = {
    name: '',
    email: '',
    tel: '',
    address: '',
  };
  orderId: string = ''; 
  orderData: any = {
    orderItems: [],
    totalAmount: 0,
  };
  subtotal: number = 0;
  shipping: number = 0;
  discountValue: number = 0;

  constructor( private http: HttpClient, private route: ActivatedRoute, private router: Router) 
  {
      const navigation = this.router.getCurrentNavigation();
      this.orderData = navigation?.extras?.state?.['orderData'];
      console.log('Dữ liệu đơn hàng:', this.orderData);
  }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const orderData = navigation?.extras?.state?.['orderData'];

    if (!orderData) {
      console.warn('Không tìm thấy dữ liệu đơn hàng trong state. Đang tải từ API...');
      return;
    }  
    const state = history.state;
  if (state?.orderData) {
    this.orderData = state.orderData;
    this.subtotal = state.orderData.subtotal;
    this.userId = state.orderData.userId;
    this.shipping = state.orderData.shipping;
    this.discountValue = state.orderData.discountValue;
    this.orderId = state.orderData.orderId;
    console.log('Dữ liệu nhận được:', this.orderData);
  } else {
    console.warn('Không tìm thấy dữ liệu từ trang Cart. Đang tải từ API...');
    this.route.paramMap.subscribe(params => {
      this.orderId = params.get('orderId') || '';
      if (this.orderId) {
        this.getOrderData(this.orderId);
      } else {
        console.error('Không tìm thấy orderId trong URL.');
      }
    });
  }
    const token = this.getToken();

    if (token) {
      const userId = this.getUserIdFromToken(token);

      if (userId) {
        this.getUserData(userId);
      } else {
        console.error('Không thể lấy UserId từ token.');
      }
    } else {
      console.error('Không tìm thấy token!');
      alert('Bạn cần đăng nhập trước khi thực hiện thao tác này.');
    }


    this.http.get(`/query/api/v1/order/${this.orderId}`).subscribe({
      next: (response: any) => {
        console.log('Phản hồi từ API đơn hàng:', response);

        const order = response.data;

        this.orderData = {
          orderItems: order.orderItems || [],
          totalAmount: order.totalAmount || 0,
        };

        console.log('Dữ liệu đơn hàng sau khi xử lý:', this.orderData);
      },
      error: (err) => {
        console.error('Lỗi khi gọi API đơn hàng:', err);
        alert('Không thể tải dữ liệu đơn hàng!');
      }
    });
  }

  getToken(): string | null {
    const token = localStorage.getItem('token'); 
    console.log('Lấy token từ localStorage:', token);
    return token;
  }

  getUserIdFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token); 
      console.log('Payload từ token:', decoded);
      return decoded?.sub || null; 
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error);
      return null;
    }
  }

  getUserData(userId: string): void {
    console.log('Gọi API lấy dữ liệu người dùng với userId:', userId);

    this.http.get(`/query/api/v1/user/${userId}`).subscribe({
      next: (response: any) => {
        console.log('Phản hồi từ API:', response);

        this.user = {
          name: response.data?.name || 'Không có tên',
          email: response.data?.email || 'Không có email',
          tel: response.data?.tel || 'Không có số điện thoại',
          address: response.data?.address || 'Không có địa chỉ',
        };
        console.log('Dữ liệu người dùng sau khi xử lý:', this.user);
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
        alert('Không thể tải thông tin người dùng!');
      }
    });
  }

  getOrderData(orderId: string): void {
    console.log('Gọi API lấy dữ liệu đơn hàng với orderId:', orderId);
    console.log('Order ID:', this.orderId);
    this.http.get(`/query/api/v1/order/${this.orderId}`).subscribe({
      next: (response: any) => {
        console.log('Phản hồi từ API đơn hàng:', response);
  
        const order = response.data;
  
        this.orderData = {
          orderItems: order.orderItems || [],
          totalAmount: order.totalAmount || 0
        };
  
        console.log('Dữ liệu đơn hàng sau khi xử lý:', this.orderData);
      },
      error: (err) => {
        console.error('Lỗi khi gọi API đơn hàng:', err);
        alert('Không thể tải dữ liệu đơn hàng!');
      }
    });
  }

  onPaymentMethodChange(paymentMethod: string) {
    this.selectedPaymentMethod = paymentMethod;
  }
  

  // Hàm xử lý khi nhấn nút "Place Order"
  placeOrder() {
    if (!this.selectedPaymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán.');
      return;
    }
  
    this.receiptData = {
      orderId: this.orderId,
      orderDate: new Date().toLocaleString(),   
      subtotal: this.subtotal,  
      discountValue: this.discountValue,
      shipping: this.shipping,
      totalAmount: this.orderData.totalAmount
    };
  
    if (this.selectedPaymentMethod === 'Cash') {
      this.router.navigateByUrl('/orderReceipt', { state: { orderData: this.receiptData } });
      alert('Đơn hàng đã được đặt thành công! Đang trong quá trình xử lý để giao đến khách hàng.');
    } else if (this.selectedPaymentMethod === 'VN-Pay') {
      console.log('total amount:', this.orderData.totalAmount);
      const total = this.orderData.totalAmount * 1000;
      const apiUrl = '/command/api/v1/payment/CreatePaymentUrl';
      const params = {
        money: total.toString(),
        description: 'Payment Bill',
        orderId: this.orderId
      };

      this.http.get(apiUrl, { params, responseType: 'text' }).subscribe({
        next: (paymentUrl: string) => {
          window.location.href = paymentUrl; // Điều hướng đến URL thanh toán VNPAY
        },
        error: (err) => {
          console.error('Có lỗi xảy ra:', err);
          alert('Không thể tạo URL thanh toán. Vui lòng thử lại.');
        },
      });
  }}
}
