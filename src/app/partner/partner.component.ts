import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-partner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner.component.html',
  styleUrl: './partner.component.scss'
})
export class PartnerComponent implements OnInit  {

  partners: { items: Partner[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = [];// Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  partner: any = { name: '', icon: '', description: '', tel: '', email: '', website: '', address: '', insertedAt:'' };
  selectedPartner: any = { name: '', icon: '', description: '', tel: '', email: '', website: '',address: '', insertedAt:'', isDeleted: true };
  previewImage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`/query/api/v1/partner/paging?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.partners.items = response.data.items;
      this.currentPage = pageNumber; // Cập nhật trang hiện tại
      this.totalPages = response.data.totalPages; // Cập nhật tổng số trang từ response (nếu có)
      this.updatePagination(); // Cập nhật danh sách số trang
    });
}

// Hàm cập nhật danh sách số trang
updatePagination(): void {
  this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openUpdateModal(partnerId: string) {
    // Tìm partner dựa trên partnerId
    const partner = this.partners.items.find(item => item.id === partnerId); // Sử dụng this.partners thay vì this.partner
    if (partner) {
      this.selectedPartner = { ...partner };  // Sao chép dữ liệu partner vào selectedPartner để chỉnh sửa
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  openDetailModal(partnerId: string) {
    // Tìm partner dựa trên partnerId
    const partner = this.partners.items.find(item => item.id === partnerId); // Sử dụng this.partners thay vì this.partner
    if (partner) {
      this.selectedPartner = { ...partner };  // Sao chép dữ liệu partner vào selectedPartner để chỉnh sửa
      this.showDetailModal = true;
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      // Chuyển đổi file sang Base64
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.partner.icon = this.previewImage;
      };
      
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.partner.name || !this.partner.description || !this.partner.icon || !this.partner.tel || !this.partner.email || !this.partner.website) {
      alert('Please fill in all required fields!');
      return;
    }
    const token = localStorage.getItem('token'); 
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
    const apiUrl = '/command/api/v1/partner';
    this.http.post(apiUrl, this.partner, { headers }).subscribe(
      response => {
        alert('Partner added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
      },
      error => {
        alert('Error adding partner. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
    if (!this.selectedPartner.icon || this.selectedPartner.icon.trim() === '' || !isValidBase64(this.selectedPartner.icon)) {
      this.selectedPartner.icon = null;
    }
    const isDeletedValue = this.selectedPartner.isDeleted !== undefined ? this.selectedPartner.isDeleted : true; // default true if not selected
    this.selectedPartner.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedPartner.isDeleted);
    console.log('Selected Partner Icon:', this.selectedPartner.icon);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    const partnerId = this.selectedPartner.id; // Get the partnerId from the selectedPartner object
    const apiUrl = `/command/api/v1/partner?id=${partnerId}`;  // Use partnerId in API request
    console.log('Selected Partner:', this.selectedPartner);
    this.http.put(apiUrl, this.selectedPartner, { headers }).subscribe(
      response => {
        alert('Partner updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected Partner:', this.selectedPartner);
      },
      error => {
        alert('Error updating partner. Please try again.');
      }
    );
  }


  deletePartner(partnerId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/partner?id=${partnerId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('Partner deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting partner. Please try again.');
        }
    );
}
}

interface Partner {
  id: string;
  name: string;
  style: string;
  icon: string;
  description: string;
  tel: string;
  email: string;
  website: string;
  address: string;
  views: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
};

function isValidBase64(str: string): boolean {
  const base64Regex = /^data:image\/(jpeg|png|gif|webp);base64,/i;
  return base64Regex.test(str);
}