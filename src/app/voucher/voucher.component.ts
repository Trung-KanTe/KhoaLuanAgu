import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-voucher',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, RouterModule],
  templateUrl: './voucher.component.html',
  styleUrl: './voucher.component.scss'
})
export class VoucherComponent implements OnInit {

  vouchers: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {     
      this.loadVouchers();
    }  

  loadVouchers() {
    this.http.get(`/query/api/v1/promotion`).subscribe((response: any) => {
      this.vouchers = response.data;
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    alert('Discount code copied successfully');
  }
}
