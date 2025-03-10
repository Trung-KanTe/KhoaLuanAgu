import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-import-product',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './import-product.component.html',
  styleUrl: './import-product.component.scss'
})
export class ImportProductComponent implements OnInit  {

  importProducts: { items: ImportProduct[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = []; // Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  importProduct: any = { note: '', importDate: '', importProductDetails: [], partner: { name: '', id: '' }, wareHouse: { name: '', id: '' } };
  selectedImportProduct: any = { note: '', importDate: '', importProductDetails: [], partner: { name: '', id: '' }, wareHouse: { name: '', id: '' }};
  importProductDetails: any[] = [];
  partners: any[] = [];
  selectedPartner: string = '';
  quantity: number = 0;
  products: any[] = [];  // List of products
  productDetails: any[] = [];  // Details of selected product (size-color)
  selectedProductDetails: any[] = [];
  wareHouses: any[] = [];
  selectedWareHouse: string = '';
  sizes: string[] = ['S', 'M', 'L', 'XL'];
  colors: string[] = ['Red', 'Blue', 'White', 'Black'];
  selectedSize: string = '';
  selectedColor: string = '';
  selectedImportProductDetails: string[] = [];
  selectedProductId: string = '';
  selectedProduct: any;
  selectedDetailId: string = '';
  selectedDetailQuantity: number = 0;
  selectedPairs: any[] = [];
  displayedProductList: any[] = [];
  updateProductList: any[] = [];
  isProductDetailsVisible: boolean = false;
  formatPrice(product: any, event: any) {
    let inputValue = event.target.value;
  
    // Loại bỏ mọi ký tự không phải số
    inputValue = inputValue.replace(/\D/g, '');
  
    // Định dạng giá trị với dấu phân cách hàng nghìn
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
    // Cập nhật giá trị với định dạng
    product.price = formattedValue;
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
    this.loadPartners();
    this.loadWareHouses();
    this.loadProducts();
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }

    this.http.get(`https://localhost:5000/query/api/v1/importProduct/paging?pageNumber=${pageNumber}`).subscribe((response: any) => {
      this.importProducts.items = response.data.items;     
      this.currentPage = pageNumber; // Cập nhật trang hiện tại
      this.totalPages = response.data.totalPages; // Cập nhật tổng số trang từ response (nếu có)
      this.updatePagination(); // Cập nhật danh sách số trang
    });
}

// Hàm cập nhật danh sách số trang
updatePagination(): void {
  this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

  loadPartners() {
    this.http.get('/query/api/v1/partner').subscribe((response: any) => {
      console.log('Partners:', response.data);
      this.partners = response.data;
    });
  }
  
  loadWareHouses() {
    this.http.get('/query/api/v1/wareHouse').subscribe((response: any) => {
      console.log('Warehouses:', response.data);
      this.wareHouses = response.data;
    });
  }

  loadProducts() {
    this.http.get('/query/api/v1/product').subscribe((response: any) => {
      this.products = response.data; // Lưu dữ liệu phân loại vào biến importProductDetails
    });
  }

  loadProductDetails() {
    const selectedProduct = this.products.find(product => product.id === this.selectedProductId);
  
    if (selectedProduct) {
      this.productDetails = selectedProduct.productDetails.map((detail: ProductDetail) => ({
        ...detail,
        stockQuantity: 0,
        selected: false,
      }));
      // Hiển thị bảng Product Details khi chọn sản phẩm
      this.isProductDetailsVisible = true;  // Điều này sẽ giúp hiển thị bảng Product Details
    } else {
      this.productDetails = [];
      this.isProductDetailsVisible = false;  // Ẩn bảng Product Details nếu không có sản phẩm nào được chọn
    }
  }
   // Giả sử bạn có phương thức loadProductDetails() để tìm và lưu thông tin sản phẩm được chọn.
   loadImportProducts() {
    const selectedProduct = this.products.find(product => product.id === this.selectedProductId);
  
    if (selectedProduct) {
      const selectedDetails = this.productDetails.filter(detail => detail.selected && detail.stockQuantity > 0);
  
      if (selectedDetails.length === 0) {
        alert('Vui lòng chọn ít nhất một chi tiết sản phẩm và nhập số lượng.');
        return;
      }
  
      // Tính tổng số lượng cho từng chi tiết được chọn
      const totalQuantity = selectedDetails.reduce((sum, detail) => sum + detail.stockQuantity, 0);
  
      // Kiểm tra xem sản phẩm đã tồn tại trong danh sách chưa
      const existingProduct = this.displayedProductList.find(product => product.productId === selectedProduct.id);
  
      if (existingProduct) {
        existingProduct.quantity += totalQuantity;
      } else {
        this.displayedProductList.push({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          price: 0,
          quantity: totalQuantity
        });
      }
  
      // Reset trạng thái sau khi thêm
      this.productDetails.forEach(detail => {
        detail.selected = false;
        detail.stockQuantity = 0;
      });
  
      this.selectedProductId = '';
      this.isProductDetailsVisible = false;
    }
  }

  get totalQuantity(): number {
    // Tính tổng stockQuantity của tất cả productDetail đã được chọn (selected = true)
    return this.productDetails
      .filter(detail => detail.selected)  // Lọc ra những detail đã được chọn
      .reduce((total, detail) => total + detail.stockQuantity, 0); // Tính tổng stockQuantity
  }

  addSelectedProductDetails() {
    // Lọc các productDetails đã được chọn và có quantity > 0
    const selectedDetails = this.productDetails
      .filter(detail => detail.selected && detail.stockQuantity > 0)
      .map(detail => ({
        id: detail.id,  // Lấy id của từng chi tiết sản phẩm
        stockQuantity: detail.stockQuantity  // Lấy số lượng tồn kho đã nhập
      }));
  
    // Tạo đối tượng JSON theo cấu trúc yêu cầu
    const selectedProductDetailsPayload = {
      productDetail: selectedDetails
    };
  
    // In ra để kiểm tra dữ liệu
    console.log('Selected Details:' ,selectedProductDetailsPayload);
  
    // Sau khi lấy dữ liệu, bạn có thể làm gì đó với selectedProductDetailsPayload,
    // chẳng hạn như gửi tới API hoặc lưu trữ vào một biến nào đó.
    this.selectedProductDetails.push(...selectedDetails); // Đẩy các chi tiết sản phẩm đã chọn vào danh sách
  }

  prepareImportProductDetails() {
    this.importProduct.importProductDetails = this.updateProductList
    this.importProduct.importProductDetails = this.displayedProductList
      .filter(product => product.price > 0 && product.quantity > 0) // Bỏ qua các sản phẩm không hợp lệ
      .map(product => ({
        productId: product.productId,  // Lấy ID sản phẩm
        importPrice: product.price,    // Giá nhập được nhập từ input
        quantity: product.quantity     // Số lượng tồn kho
      }));
  
    console.log('Prepared Import Product Details:', this.importProduct.importProductDetails);
  }

  removePair(index: number) {
    this.selectedPairs.splice(index, 1);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  openUpdateModal(importProductId: string) {
    // Tìm importProduct dựa trên importProductId
    const importProduct = this.importProducts.items.find(item => item.id === importProductId); // Sử dụng this.importProducts thay vì this.importProduct
    if (importProduct) {
      this.selectedImportProduct = { ...importProduct };  // Sao chép dữ liệu importProduct vào selectedImportProduct để chỉnh sửa
      this.selectedPairs = [];
      this.selectedImportProduct.importProductDetails.forEach((pair: any) => {
        this.selectedPairs.push({ size: pair.size, color: pair.color });
      });
      this.showUpdateModal = true;
    }
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
  }

  openDetailModal(storeId: string) {
    // Tìm store dựa trên storeId
    const store = this.importProducts.items.find(item => item.id === storeId); // Sử dụng this.stores thay vì this.store
    if (store) {
      this.selectedImportProduct = { ...store };  // Sao chép dữ liệu store vào selectedStore để chỉnh sửa
      this.showDetailModal = true;
    }
  }

  closeDetailModal() {
    this.showDetailModal = false;
  }

  saveChanges() {   

    this.prepareImportProductDetails();
    const createImportProductData = {
    note: this.importProduct.note,
    partnerId: this.importProduct.partner.id,  // Sử dụng partnerId
    wareHouseId: this.importProduct.wareHouse.id,        // Sử dụng wareHouseId
    importProductDetails: this.importProduct.importProductDetails  
  };

    const token = localStorage.getItem('token'); 
        console.log('Token gửi đi:', token);
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
      const payload = {
          productDetail: this.selectedProductDetails.map(detail => ({
            id: detail.id,
            stockQuantity: detail.stockQuantity
          }))
        };
    const apiUrlDetail = '/command/api/v1/product/stockQuantity';
    console.log('Selected ProductDetail:', payload);
    this.http.put(apiUrlDetail, payload).subscribe(
      response => {          
      },
      error => {
        alert('Error update stockQuantity. Please try again.');
      }
    );
    const apiUrl = '/command/api/v1/importProduct';
    console.log('Selected ImportProduct:', createImportProductData);
    this.http.post(apiUrl, createImportProductData , { headers }).subscribe(
      response => {       
        alert('ImportProduct added successfully!');
        this.loadPage(this.currentPage);
        this.closeModal();
        this.cdr.detectChanges();
      },
      error => {
        alert('Error adding importProduct. Please try again.');
      }
    );
  }

  saveUpdateChanges() {

  // Gán các giá trị ID của wareHouse, partner và shop thay vì đối tượng
  const updateImportProductData = {
    note: this.selectedImportProduct.note,
    partnerId: this.selectedImportProduct.partner.id,  // Sử dụng partnerId
    wareHouseId: this.selectedImportProduct.wareHouse.id,        // Sử dụng wareHouseId
    isDeleted: this.selectedImportProduct.isDeleted !== undefined ? this.selectedImportProduct.isDeleted : true , // Kiểm tra và gán giá trị isDeleted
    importProductDetails: this.selectedImportProduct.importProductDetails  
  };

  console.log('Selected update data:', updateImportProductData);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    console.log('Selected updateData:', updateImportProductData);
    const importProductId = this.selectedImportProduct.id; // Get the importProductId from the selectedImportProduct object
    const apiUrl = `/command/api/v1/importProduct?id=${importProductId}`;  // Use importProductId in API request
    this.http.put(apiUrl, updateImportProductData, { headers }).subscribe(
      response => {
        alert('ImportProduct updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected ImportProduct:', this.selectedImportProduct);
        this.cdr.detectChanges();
      },
      error => {
        alert('Error updating importProduct. Please try again.');
      }
    );
  }

  deleteImportProduct(importProductId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/importProduct?id=${importProductId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('ImportProduct deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting importProduct. Please try again.');
        }
    );
  }

}

interface ImportProductDetail {
  productId: string;
  importPrice: string;
  quantity: string;
  id: string;
}

interface Partner {
  name: string;
  id: string;
}
interface WareHouse {
  name: string;
  id: string;
}

interface ImportProduct {
  id: string;
  note: string;
  importDate: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
  importProductDetails: ImportProductDetail[];   // Thêm thuộc tính importProductDetails
  partner: Partner;
  wareHouse: WareHouse;
}

interface ProductDetail {
  productId: string;
  size: string;
  color: string;
  stockQuantity: number;
  id: string;
  quantity?: number;
  selected?: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string
  views: string;
  status: boolean;
  insertedAt: string;  
  isDeleted: boolean;
  productDetails: ProductDetail[];   // Thêm thuộc tính productDetails
}

