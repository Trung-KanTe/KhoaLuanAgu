import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit  {

  products: { items: Product[] } = { items: [] };
  currentPage: number = 1; 
  totalPages: number = 1; // Tổng số trang
  totalPagesArray: number[] = [];// Số trang tổng cộng (có thể lấy từ response)
  showModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  product: any = { name: '', description: '', image: '', price: '', views: '', productDetails: [], category: { name: '', id: '' }, brand: { name: '', id: '' }, shop: { name: '', id: '' } };
  selectedProduct: any = { name: '', description: '', image: '', price: '', views: '', isDeleted: true, productDetails: [], category: { name: '', id: '' }, brand: { name: '', id: '' }, shop: { name: '', id: '' }   };
  previewImage: string | null = null;
  productDetails: any[] = [];
  categorys: any[] = [];
  selectedCategory: string = '';
  brands: any[] = [];
  selectedBrand: string = '';
  shops: any[] = [];
  selectedShop: string = '';
  sizes: string[] = ['S', 'M', 'L', 'XL'];
  colors: string[] = ['Red', 'Blue', 'White', 'Black', 'Green'];
  selectedSize: string = '';
  selectedColor: string = '';
  selectedPairs: { size: string; color: string }[] = [];
  selectedProductDetails: string[] = [];
  formatPrice(event: any) {
    let inputValue = event.target.value;
  
    // Loại bỏ mọi ký tự không phải số
    inputValue = inputValue.replace(/\D/g, '');
  
    // Định dạng giá trị với dấu phân cách hàng nghìn
    const formattedValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
    // Cập nhật giá trị với định dạng
    this.product.price = formattedValue;
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);  // Lấy dữ liệu trang đầu tiên khi khởi tạo
    this.loadBrands();
    this.loadCategorys();
    this.loadShops();
  }

  loadPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // Nếu pageNumber không hợp lệ thì không làm gì
    }
  
    this.http.get(`/query/api/v1/product/paging?pageNumber=${pageNumber}`)
      .subscribe((response: any) => {
        this.products.items = response.data.items;
        this.currentPage = pageNumber;
        this.totalPages = response.data.totalPages; 
        this.updatePagination(); // Cập nhật danh sách số trang
      });
  }
  
  // Hàm cập nhật danh sách số trang
  updatePagination(): void {
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  loadBrands() {
    this.http.get('https://localhost:5000/query/api/v1/brand/name').subscribe((response: any) => {
      this.brands = response.data; // Lưu dữ liệu phân loại vào biến productDetails
    });
  }

  loadCategorys() {
    this.http.get('https://localhost:5000/query/api/v1/category/name').subscribe((response: any) => {
      this.categorys = response.data; // Lưu dữ liệu phân loại vào biến productDetails
    });
  }

  loadShops() {
    this.http.get('https://localhost:5000/query/api/v1/shop').subscribe((response: any) => {
      this.shops = response.data; // Lưu dữ liệu phân loại vào biến productDetails
    });
  }

  addSizeColorPair() {
    if (this.selectedSize && this.selectedColor) {
      const newPair = { size: this.selectedSize, color: this.selectedColor };
    
    // Thêm vào selectedPairs để hiển thị
      this.selectedPairs.push(newPair);
      
      // Thêm vào productDetails để gửi đi khi Update
      this.selectedProduct.productDetails.push(newPair);
      // Thêm cặp size-color vào productDetails
      this.product.productDetails.push({ size: this.selectedSize, color: this.selectedColor }); 
      // Xóa dữ liệu đã chọn để sẵn sàng cho lựa chọn tiếp theo
      this.selectedSize = '';
      this.selectedColor = '';
    }
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

  openUpdateModal(productId: string) {
    // Tìm product dựa trên productId
    const product = this.products.items.find(item => item.id === productId); // Sử dụng this.products thay vì this.product
    if (product) {
      this.selectedProduct = { ...product };  // Sao chép dữ liệu product vào selectedProduct để chỉnh sửa
      this.selectedPairs = [];
      this.selectedProduct.productDetails.forEach((pair: any) => {
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
    const store = this.products.items.find(item => item.id === storeId); // Sử dụng this.stores thay vì this.store
    if (store) {
      this.selectedProduct = { ...store };  // Sao chép dữ liệu store vào selectedStore để chỉnh sửa
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
        this.product.image = this.previewImage;
        this.selectedProduct.image = this.previewImage; // Gán giá trị mới cho image khi chọn ảnh
        console.log('Icon Base64:', this.selectedProduct.image);
        this.cdr.detectChanges();
      };
      
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (!this.product.name || !this.product.description || !this.product.image || !this.product.price) {
      alert('Please fill in all required fields!');
      return;
    }
     // Gán các giá trị ID của brand, category và shop thay vì đối tượng
  const createProductData = {
    name: this.product.name,
    description: this.product.description,
    price: this.product.price,
    categoryId: this.product.category.id,  // Sử dụng categoryId
    brandId: this.product.brand.id,        // Sử dụng brandId
    shopId: this.product.shop.id,          // Sử dụng shopId
    image: this.product.image,
    productDetails: this.product.productDetails  
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
    const apiUrl = '/command/api/v1/product';
    this.http.post(apiUrl, createProductData , { headers }).subscribe(
      response => {
        alert('Product added successfully!');
        this.loadPage(this.currentPage);
        this.resetProduct();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error => {
        alert('Error adding product. Please try again.');
      }
    );
  }

  saveUpdateChanges() {
    // Kiểm tra xem có thay đổi ảnh không
  if (!this.selectedProduct.image || this.selectedProduct.image.trim() === '' || !isValidBase64(this.selectedProduct.image)) {
    this.selectedProduct.image = null;
  }

  const updatedProductDetails = this.selectedProduct.productDetails && this.selectedProduct.productDetails.length > 4
    ? this.selectedProduct.productDetails
    : null;

  // Gán các giá trị ID của brand, category và shop thay vì đối tượng
  const updateProductData = {
    id: this.selectedProduct.id,
    name: this.selectedProduct.name,
    description: this.selectedProduct.description,
    views: this.selectedProduct.views,
    price: this.selectedProduct.price,
    categoryId: this.selectedProduct.category.id,  // Sử dụng categoryId
    brandId: this.selectedProduct.brand.id,        // Sử dụng brandId
    shopId: this.selectedProduct.shop.id,          // Sử dụng shopId
    image: this.selectedProduct.image,
    isDeleted: this.selectedProduct.isDeleted !== undefined ? this.selectedProduct.isDeleted : true , // Kiểm tra và gán giá trị isDeleted
    productDetails: updatedProductDetails
  };

  console.log('Selected update data:', updateProductData);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    console.log('Selected updateData:', updateProductData);
    const productId = this.selectedProduct.id; // Get the productId from the selectedProduct object
    const apiUrl = `/command/api/v1/product?id=${productId}`;  // Use productId in API request
    this.http.put(apiUrl, updateProductData, { headers }).subscribe(
      response => {
        alert('Product updated successfully!');
        this.loadPage(this.currentPage); // Reload page after update
        this.closeUpdateModal(); // Close the modal after saving
        console.log('Selected Product:', this.selectedProduct);
        this.cdr.detectChanges();
      },
      error => {
        alert('Error updating product. Please try again.');
      }
    );
  }

  getProductDetailNameFromList(productDetailId: string): string {
    const productDetail = this.productDetails.find(c => c.id === productDetailId);
    return productDetail ? productDetail.name : 'Unknown'; // Nếu không tìm thấy, trả về 'Unknown'
  }


  deleteProduct(productId: string): void {
    const token = localStorage.getItem('token');
    console.log('Token gửi đi:', token);

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const apiUrl = `/command/api/v1/product?id=${productId}`;

    this.http.delete(apiUrl, { headers }).subscribe(
        response => {
            alert('Product deleted successfully!');
            this.loadPage(this.currentPage);
        },
        error => {
            alert('Error deleting product. Please try again.');
        }
    );
  }

  resetProduct() {
    this.product = {
        name: '',
        description: '',
        price: null,
        category: { id: '' },
        brand: { id: '' },
        shop: { id: '' },
        image: '',
        productDetails: [],
    };
    this.selectedPairs = []; // Xóa danh sách Size-Color đã chọn
}

}

interface ProductDetail {
  color: string;
  size: string;
  id: string;
}

interface Category {
  name: string;
  id: string;
}
interface Brand {
  name: string;
  id: string;
}
interface Shop {
  name: string;
  id: string;
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
  category: Category;
  brand: Brand;
  shop: Shop;
}

function isValidBase64(str: string): boolean {
  const base64Regex = /^data:image\/(jpeg|png|gif|webp);base64,/i;
  return base64Regex.test(str);
}

