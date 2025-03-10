import { Component, OnInit } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgClass, FormsModule, HttpClientModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  email: string = '';
  address: string = '';
  passwordHash: string = '';
  selectedUser: any = {}; 
  confirmPassword: string = '';
  tel: string = '';
  name: string = '';
  isPasswordVisibles: boolean = false;
  isPasswordVisible: boolean = false;
  wards: any[] = []; 
  provinces: any[] = [];
  districts: any[] = [];
  selectedProvinceId: string = ''; 
  selectedDistrictId: string = ''; 
  selectedWardId: string = ''; 

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadProvinces();
  }

  togglePasswordVisibiliti(): void {
    this.isPasswordVisibles = !this.isPasswordVisibles;
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    if (this.passwordHash !== this.confirmPassword) {
      alert('Passwords do not match. Please re-enter your password.');
      return;
    }

    const registerData = {
      email: this.email,
      passwordHash: this.passwordHash,
      name: this.name,
      tel: this.tel,
      address: this.address,
      wardId: this.selectedUser.ward
    };

    console.log("Register data:", registerData);
  
    this.http.post<{ isSuccess: boolean; message?: string }>(
      '/command/api/v1/register',
      registerData,
      { headers: { 'Content-Type': 'application/json', 'x-api-version': '1.0' } }
    ).subscribe({
      next: (response) => {
        console.log('RegisterData:', registerData);
        if (response.isSuccess) {
          alert('Registration successful! You can now log in.');
          this.router.navigate(['/login']);
        } else {
          alert('Registration failed: ' + (response.message || 'Please try again later.'));
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again!');
      }
    });
  }

  private loadProvinces(): void {
    this.http.get('/query/api/v1/province').subscribe((response: any) => {
      this.provinces = response.data;
    });
  }

  onProvinceChange() {
    if (this.selectedUser.province) {
      this.http.get(`/query/api/v1/district/${this.selectedUser.province}`)
        .subscribe((response: any) => {
          this.districts = response.data;
          this.selectedUser.district = ''; // Reset District khi chọn Province mới
          this.wards = []; // Reset Wards
        });
    }
  }
  
  onDistrictChange() {
    if (this.selectedUser.district) {
      this.http.get(`/query/api/v1/ward/district/${this.selectedUser.district}`)
        .subscribe((response: any) => {
          this.wards = response.data;
          this.selectedUser.ward = ''; // Reset Ward khi chọn District mới
        });
    }
  }
}
