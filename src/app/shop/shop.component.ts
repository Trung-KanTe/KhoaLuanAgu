import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
    products: any[] = [];
    pageNumber: number = 1;
    pageSize: number = 6;
    totalPages: number = 1;
  
    constructor(private http: HttpClient) {}
     
  
      ngOnInit(): void {
        this.loadProducts();
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
