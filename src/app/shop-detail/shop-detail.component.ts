import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './shop-detail.component.html',
  styleUrl: './shop-detail.component.scss'
})
export class ShopDetailComponent implements OnInit {
  products: any[] = [];
  productDetails: any[] = [];
  pageNumber: number = 1;
  pageSize: number = 18;
  pageSizeDetail: number = 6;
  totalPages: number = 1;

  constructor(private http: HttpClient) {}
   

    ngOnInit(): void {
      this.loadProducts();
      this.loadProductDetails();
    }

    loadProductDetails(): void {
      this.http.get(`/query/api/v1/product/all?pageNumber=${this.pageNumber}&pageSize=${this.pageSizeDetail}`)
        .subscribe((response: any) => {
          this.productDetails = response.data.items;
          this.totalPages = response.data.totalPages;
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
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }  
}