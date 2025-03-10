import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ware-house',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ware-house.component.html',
  styleUrl: './ware-house.component.scss'
})
export class WareHouseComponent implements OnInit  {

  wareHouses: { items: WareHouse[] } = { items: [] };
  currentPage: number = 1; // Biến theo dõi trang hiện tại
  totalPages: number = 2; // Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  wareHouse: any = { name: '', address: '' };
  selectedWareHouse: any = { name: '', address: '', isDeleted: true };
  previewImage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`https://localhost:5000/query/api/v1/wareHouse/paging?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.wareHouses.items = response.data.items;
      this.currentPage = pageNumber; // Cập nhật trang hiện tại
      this.totalPages = response.data.totalPages; // Cập nhật tổng số trang từ response (nếu có)
      console.log(response);
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openUpdateModal(wareHouseId: string) {
    // Tìm wareHouse dựa trên wareHouseId
    const wareHouse = this.wareHouses.items.find(item => item.id === wareHouseId); // Sử dụng this.wareHouses thay vì this.wareHouse
    if (wareHouse) {
      this.selectedWareHouse = { ...wareHouse };  // Sao chép dữ liệu wareHouse vào selectedWareHouse để chỉnh sửa
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  saveChanges() {
    if (!this.wareHouse.name || !this.wareHouse.address) {
      alert('Please fill in all required fields!');
      return;
    }
    const token = localStorage.getItem('token'); 
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
    const apiUrl = '/command/api/v1/wareHouse';
    this.http.post(apiUrl, this.wareHouse, { headers }).subscribe(
      response => {
        alert('WareHouse added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
      },
      error => {
        alert('Error adding wareHouse. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
    const isDeletedValue = this.selectedWareHouse.isDeleted !== undefined ? this.selectedWareHouse.isDeleted : true; // default true if not selected
    this.selectedWareHouse.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedWareHouse.isDeleted);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const wareHouseId = this.selectedWareHouse.id; // Get the wareHouseId from the selectedWareHouse object
    const apiUrl = `/command/api/v1/wareHouse?id=${wareHouseId}`;  // Use wareHouseId in API request
    console.log('Selected WareHouse:', this.selectedWareHouse);
    this.http.put(apiUrl, this.selectedWareHouse, { headers }).subscribe(
      response => {
        alert('WareHouse updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected WareHouse:', this.selectedWareHouse);
      },
      error => {
        alert('Error updating wareHouse. Please try again.');
      }
    );
  }


  deleteWareHouse(wareHouseId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/wareHouse?id=${wareHouseId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('WareHouse deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting wareHouse. Please try again.');
        }
    );
}
}

interface WareHouse {
  id: string;
  name: string;
  address: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
};