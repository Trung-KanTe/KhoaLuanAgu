import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-classification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classification.component.html',
  styleUrl: './classification.component.scss'
})
export class ClassificationComponent implements OnInit  {

  classifications: { items: Classification[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = []; // Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  classification: any = { name: '', style: '', icon: '' };
  selectedClassification: any = { name: '', style: '', icon: '', views: '', isDeleted: true };
  previewImage: string | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`/query/api/v1/classification?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.classifications.items = response.data.items;
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

  openUpdateModal(classificationId: string) {
    // Tìm classification dựa trên classificationId
    const classification = this.classifications.items.find(item => item.id === classificationId); // Sử dụng this.classifications thay vì this.classification
    if (classification) {
      this.selectedClassification = { ...classification };  // Sao chép dữ liệu classification vào selectedClassification để chỉnh sửa
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      // Chuyển đổi file sang Base64
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.classification.icon = this.previewImage;
        this.selectedClassification.icon = this.previewImage; // Gán giá trị mới cho icon khi chọn ảnh
        console.log('Icon Base64:', this.selectedClassification.icon);
        this.cdr.detectChanges();
      };
      
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.classification.name || !this.classification.style || !this.classification.icon) {
      alert('Please fill in all required fields!');
      return;
    }
    const token = localStorage.getItem('token'); 
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
    const apiUrl = '/command/api/v1/classification';
    this.http.post(apiUrl, this.classification, { headers }).subscribe(
      response => {
        alert('Classification added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
        this.cdr.detectChanges();
      },
      error => {
        alert('Error adding classification. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
    if (!this.selectedClassification.icon || this.selectedClassification.icon.trim() === '' || !isValidBase64(this.selectedClassification.icon)) {
      this.selectedClassification.icon = null;
    }
    const isDeletedValue = this.selectedClassification.isDeleted !== undefined ? this.selectedClassification.isDeleted : true; // default true if not selected
    this.selectedClassification.isDeleted = isDeletedValue;

    console.log('Selected isDeleted:', this.selectedClassification.isDeleted);
    console.log('Selected Classification Icon:', this.selectedClassification.icon);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  
    const classificationId = this.selectedClassification.id; // Get the classificationId from the selectedClassification object
    const apiUrl = `/command/api/v1/classification?id=${classificationId}`;  // Use classificationId in API request
    console.log('Selected Classification:', this.selectedClassification);
    this.http.put(apiUrl, this.selectedClassification, { headers }).subscribe(
      response => {
        alert('Classification updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected Classification:', this.selectedClassification);
        this.cdr.detectChanges();
      },
      error => {
        alert('Error updating classification. Please try again.');
      }
    );
  }


  deleteClassification(classificationId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/classification?id=${classificationId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('Classification deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting classification. Please try again.');
        }
    );
}
}

interface Classification {
  id: string;
  name: string;
  style: string;
  icon: string;
  views: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
};

function isValidBase64(str: string): boolean {
  const base64Regex = /^data:image\/(jpeg|png|gif|webp);base64,/i;
  return base64Regex.test(str);
}
