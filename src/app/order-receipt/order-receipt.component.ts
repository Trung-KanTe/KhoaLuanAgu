import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-receipt',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-receipt.component.html',
  styleUrl: './order-receipt.component.scss'
})
export class OrderReceiptComponent implements OnInit {
  orderData: any = {};  
  orderItems: any[] = [];  

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Lấy dữ liệu đơn hàng từ state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state?.['orderData'];

    if (state) {
      this.orderData = state;
      this.orderItems = state.cartItems || [];
    } else {
      alert('Không có dữ liệu đơn hàng!');
    }
  }

  // Hàm tính tổng giá trị đơn hàng
  calculateTotal(): number {
    return this.orderItems.reduce((total, item) => total + (item.total || 0), 0);
  }
}
