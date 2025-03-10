import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, RouterModule], // Thêm FormsModule
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  providers: [DecimalPipe]
})
export class CartComponent {
  cart: any = { cartItems: [] };
  subtotal: number = 0;
  promotionCode: string = ''; 
  promotionId: string = '';
  discountValue: number = 0;
  shipping: number = 25000; 
  total: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id'); 
    console.log('UserId:', userId);
    if (userId) {
      this.http.get(`/query/api/v1/cart/${userId}`)
         .subscribe((response: any) => {
           this.cart.cartItems = response.data.cartItems;
           console.log(response);
           this.calculateSubtotal();
         });
    }
  }

  applyPromotionCode(): void {
    if (this.promotionCode == null) {
      return;
    }

    this.http.get(`/query/api/v1/promotion/${this.promotionCode}`).subscribe({
      
      next: (response: any) => {
        console.log('Response:', response);
        console.log('Data:', response.data);
        console.log('Discount Value:', response.data?.discountValue);
        const promotion = response.data;
        if (response && response.data && response.data.discountValue) {
          this.discountValue = response.data.discountValue; 
          this.calculateTotal(); 
          this.promotionId = promotion.id;
          alert(`Áp dụng mã khuyến mãi thành công! Giảm giá: ${this.discountValue}đ`);
        } else {
          alert('Mã khuyến mãi không hợp lệ!');
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
        alert('Không thể áp dụng mã khuyến mãi. Vui lòng thử lại sau!');
      }
    });
  }

  calculateTotal(): void {
    this.total = this.subtotal + this.shipping - this.discountValue;
  }

  calculateSubtotal(): void {
    this.subtotal = this.cart.cartItems.reduce((total: number, item: any) => total + (item.total || 0), 0);
    this.calculateTotal();
  } 

  removeItem(itemId: string) {
    console.log('ItemId:', itemId);
    this.http.delete(`/command/api/v1/cart/item?id=${itemId}`).subscribe({
      next: () => {
        alert('Đã xóa sản phẩm khỏi giỏ hàng!');
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Lỗi khi xóa sản phẩm');
      }
    });
  }

  increaseQuantity(itemId: string): void {
    console.log(`Đang gọi API tăng số lượng cho sản phẩm ID: ${itemId}`);
    this.http.put(`/command/api/v1/cart/item/increase?id=${itemId}`, null).subscribe({
      next: () => {
        const item = this.cart.cartItems.find((i: any) => i.id === itemId);
        if (item) {
          item.quantity += 1; // Tăng số lượng
          item.total = item.quantity * item.price; // Cập nhật tổng tiền
          this.calculateSubtotal(); // Cập nhật tổng phụ
          console.log(`Tăng số lượng thành công cho sản phẩm ID: ${itemId}`);
        }
      },
      error: (err) => {
        console.error('Lỗi khi tăng số lượng:', err);
        alert('Không thể tăng số lượng. Vui lòng thử lại!');
      }
    });
  }

  decreaseQuantity(itemId: string): void {
    console.log(`Đang gọi API giảm số lượng cho sản phẩm ID: ${itemId}`);
    this.http.put(`/command/api/v1/cart/item/decrease?id=${itemId}`, null).subscribe({
      next: () => {
        const item = this.cart.cartItems.find((i: any) => i.id === itemId);
        if (item) {
          item.quantity -= 1; // Giảm số lượng
          if (item.quantity < 1) item.quantity = 1; // Đảm bảo không giảm dưới 1
          item.total = item.quantity * item.price; // Cập nhật tổng tiền
          this.calculateSubtotal(); // Cập nhật tổng phụ
          console.log(`Giảm số lượng thành công cho sản phẩm ID: ${itemId}`);
        }
      },
      error: (err) => {
        console.error('Lỗi khi giảm số lượng:', err);
        alert('Không thể giảm số lượng. Vui lòng thử lại!');
      }
    });
  }

  order(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      alert('Không tìm thấy thông tin người dùng!');
      return;
    }
  
    const orderData: any = {
      userId: userId,
      promotionId: this.promotionId || null,
      totalAmount: this.total,
    };
    console.log('Dữ liệu gửi đi:', orderData);
    const token = localStorage.getItem('token'); 
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    this.http.post('/command/api/v1/order', orderData, { headers }).subscribe({
      next: (response: any) => {
        console.log('Phản hồi từ API:', response);
        const orderId = response.data?.id;
        if (orderId) {
          const checkoutData = {
            ...orderData,
            subtotal: this.subtotal,
            discountValue: this.discountValue,
            shipping: this.shipping,
            orderId: orderId, 
          };
          console.log('CheckOut Data:', checkoutData);
          alert('Đơn hàng đã được tạo thành công!');
          this.router.navigateByUrl('/checkout', { state: { orderData: checkoutData } });
        } else {
          alert('Không thể lấy ID đơn hàng!');
        }
      },
      error: (err) => {
        console.error('Lỗi khi tạo đơn hàng:', err);
        
        if (err.error?.code === 'DIFFERENT_SHOP') {
          alert('Các sản phẩm trong giỏ hàng phải thuộc cùng một cửa hàng.');
        } else {
          alert('Không thể tạo đơn hàng. Vui lòng thử lại sau!');
        }
      },
    });
  }
}
