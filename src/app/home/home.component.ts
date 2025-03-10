import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  pageNumber: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;
  categories: any[] = [];
  brands: any[] = [];
  stores: any[] = []

  constructor(private http: HttpClient, private router: Router) {}
  checkLogin(event: Event, path: string, id?: number) {
    event.preventDefault();
    const isLoggedIn = !!localStorage.getItem('token');
    console.log(localStorage.getItem('token'))
    if (isLoggedIn) {
        if (id !== undefined) {
            this.router.navigate([path, id]); 
        } else {
            this.router.navigate([path]);
        }
    } else {
        alert('Bạn cần đăng nhập để tiếp tục!');
        this.router.navigate(['/login']);
    }
}

    ngOnInit(): void {
      this.loadProducts();
      this.loadCategories();
      this.loadBrands();
      this.loadStores();
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

    loadCategories(): void {
      this.http.get(`/query/api/v1/category/name`)
        .subscribe((response: any) => {
          this.categories = response.data;
        });
    }
  
    startIndex = 0; // Vị trí bắt đầu hiển thị danh mục
  
    next() {
      if (this.startIndex + 8 < this.categories.length) {
        this.startIndex++;
      }
    }
    
    prev() {
      if (this.startIndex > 0) {
        this.startIndex--;
      }
    }

    loadBrands(): void {
      this.http.get(`/query/api/v1/brand/name`)
        .subscribe((response: any) => {
          this.brands = response.data;
        });
    }  
  
    startIndexBrd = 0; // Vị trí bắt đầu hiển thị danh mục
  
    nextBrd() {
      if (this.startIndexBrd + 12 < this.brands.length) {
        this.startIndexBrd++;
      }
    }
    
    prevBrd() {
      if (this.startIndexBrd > 0) {
        this.startIndexBrd--;
      }
    }

    loadStores(): void {
      this.http.get(`/query/api/v1/shop`)
        .subscribe((response: any) => {
          this.stores = response.data;
        });
    }  
  
    startIndexSt = 0; // Vị trí bắt đầu hiển thị danh mục
  
    nextSt() {
      if (this.startIndexSt + 12 < this.stores.length) {
        this.startIndexSt++;
      }
    }
    
    prevSt() {
      if (this.startIndexSt > 0) {
        this.startIndexSt--;
      }
    }

    startIndexProduct = 0; // Vị trí bắt đầu hiển thị sản phẩm Flash Sale

    nextProduct() {
      if (this.startIndexProduct + 6 < this.products.length) {
        this.startIndexProduct++;
      }
    }

    prevProduct() {
      if (this.startIndexProduct > 0) {
        this.startIndexProduct--;
      }
    }

    startIndexProductTop = 0; // Vị trí bắt đầu hiển thị sản phẩm Flash Sale

    nextProductTop() {
      if (this.startIndexProductTop + 6 < this.products.length) {
        this.startIndexProductTop++;
      }
    }

    prevProductTop() {
      if (this.startIndexProductTop > 0) {
        this.startIndexProductTop--;
      }
    }
}
