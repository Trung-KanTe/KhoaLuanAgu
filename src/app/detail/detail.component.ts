import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit {
  product: any = {};
  products: any[] = [];
  sizes: string[] = [];
  colors: string[] = [];
  selectedSize: string = '';
  selectedColor: string = '';
  quantity: number = 1; 
  userId: string = ''; 
  reviews: any[] = [];
  pageNumber: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id'); 
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); 
        this.userId = decodedToken.sub; 
      } catch (error) {
        console.error('Lỗi giải mã token:', error);
        this.userId = ''; 
      }
    } else {
      console.warn('Token không tồn tại trong Local Storage.');
    }
    console.log('User ID:', this.userId); 
    console.log('Product ID:', productId);
    this.http.get(`/query/api/v1/product/${productId}`).subscribe((response: any) => {
      if (response.data && response.data.image) {
        this.product = response.data;
        const categoryName = this.product.category?.name || '';
        if (categoryName === 'Mens_Clothing' || categoryName === 'Olds_Clothing' || categoryName === 'Childrens_Clothing' || categoryName === 'Foot Wear' || categoryName === 'Womens_Clothing') {
          this.sizes = Array.from(new Set(this.product.productDetails.map((detail: any) => detail.size))) as string[];
          this.colors = Array.from(new Set(this.product.productDetails.map((detail: any) => detail.color))) as string[];
        } else if (categoryName === 'Skincare') {
          this.sizes = Array.from(new Set(this.product.productDetails.map((detail: any) => detail.size))) as string[];
        } else if (categoryName === 'Beverages') {
          this.sizes = Array.from(new Set(this.product.productDetails.map((detail: any) => detail.size))) as string[];
        } else if (categoryName === 'Kitchen Ware') {
          this.sizes = Array.from(new Set(this.product.productDetails.map((detail: any) => detail.size))) as string[];
        }
    } else {
        this.product = { image: 'default-image' }; 
    } 
    });
    this.fetchReviews();
    this.updateViews();
    this.loadProducts();
  }

  fetchReviews() {
    const productId = this.route.snapshot.paramMap.get('id'); 
    this.http.get(`/query/api/v1/productReview?productId=${productId}`).subscribe((response: any) => {
      this.reviews = response.data;
    });
  }

  updateViews() {
    const Id = this.route.snapshot.paramMap.get('id'); 
    const apiUrl = `/command/api/v1/product/view?id=${Id}`;
    const token = localStorage.getItem('token'); 
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    this.http.put(apiUrl, {}, { 
      headers
    }).subscribe({
      next: () => {
        console.log('View count updated successfully');
      },
      error: (error) => {
        console.error('Error updating views:', error);
      }
    });
  }
  

  selectSize(size: string) {
    this.selectedSize = size;
    console.log('Size đã chọn:', this.selectedSize);
  }
  
  selectColor(color: string) {
    if (this.colors.length > 0) {
      this.selectedColor = color;
      console.log('Màu đã chọn:', this.selectedColor);
    }
  }

  addToCart() {

    const token = localStorage.getItem('token'); 
    console.log('Token gửi đi:', token);

    if (!token) {
      alert('Vui lòng đăng nhập trước khi thêm vào giỏ hàng!');
      return;
    }

    // Tạo HttpHeaders với Authorization Bearer token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    if (!this.selectedSize) {
      alert('Vui lòng chọn Size trước khi thêm vào giỏ hàng');
      return;
    }
  
    let selectedDetail;
    if (this.colors.length > 0) {
      if (!this.selectedColor) {
        alert('Vui lòng chọn Màu trước khi thêm vào giỏ hàng');
        return;
      }
      selectedDetail = this.product.productDetails.find(
        (detail: any) => detail.size === this.selectedSize && detail.color === this.selectedColor
      );
    } else {
      selectedDetail = this.product.productDetails.find(
        (detail: any) => detail.size === this.selectedSize
      );
    }
  
    if (!selectedDetail) {
      alert('Không tìm thấy sản phẩm với Size và Màu đã chọn');
      return;
    }
    const cartData = {
      userId: this.userId, 
      cartItems: [
        {
          productDetailId: selectedDetail.id,  
          price: this.product.price,
          quantity: this.quantity
        }
      ]
    };

    console.log('Dữ liệu gửi đi:', cartData);

    this.http.post('/command/api/v1/cart', cartData, { headers }).subscribe({
      next: () => alert('Đã thêm vào giỏ hàng thành công!'),
      error: (error) => {
        console.error('Lỗi chi tiết:', error);
        alert('Thêm vào giỏ hàng thất bại! Kiểm tra lại dữ liệu gửi đi.');
      }
    });
  }

  loadProducts(): void {
    this.http.get(`/query/api/v1/product/all?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`)
      .subscribe((response: any) => {
        this.products = response.data.items;
        this.totalPages = response.data.totalPages;
      });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNumber = page;
      this.loadProducts();
    }
  }

  getDisplayedPages(): number[] {
    const pagesToShow = 3; // Luôn hiển thị 3 trang
    let maxPages = Math.max(this.totalPages, pagesToShow); // Nếu totalPages < 3, vẫn hiển thị 1 2 3
    return Array.from({ length: maxPages }, (_, i) => i + 1);
  }
}
