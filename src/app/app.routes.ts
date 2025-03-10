import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ShopComponent } from './shop/shop.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CartComponent } from './cart/cart.component';
import { DetailComponent } from './detail/detail.component';
import { ShopDetailComponent } from './shop-detail/shop-detail.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderReceiptComponent } from './order-receipt/order-receipt.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { AuthGuard } from './auth.guard';
import { UserComponent } from './user/user.component';
import { OrderComponent } from './order/order.component';
import { RoleComponent } from './role/role.component';
import { BrandComponent } from './brand/brand.component';
import { ProductComponent } from './product/product.component';
import { PromotionComponent } from './promotion/promotion.component';
import { WareHouseComponent } from './ware-house/ware-house.component';
import { ImportProductComponent } from './import-product/import-product.component';
import { StoreComponent } from './store/store.component';
import { PartnerComponent } from './partner/partner.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { VoucherComponent } from './voucher/voucher.component';
import { PasswordComponent } from './password/password.component';
import { ProfileComponent } from './profile/profile.component';
import { ClassificationComponent } from './classification/classification.component';
import { CategoryComponent } from './category/category.component';
import { StaffComponent } from './staff/staff.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent},
  { path: 'shopDetail', component: ShopDetailComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart/:id', component: CartComponent, canActivate: [AuthGuard]},
  { path: 'product/:id', component: DetailComponent},
  { path: 'voucher', component: VoucherComponent},
  { path: 'password', component: PasswordComponent},
  { path: 'checkout', component: CheckoutComponent},
  { path: 'purchase/:id', component: PurchaseComponent, canActivate: [AuthGuard]},
  { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: 'orderReceipt', component: OrderReceiptComponent},
  { path: 'paymentSuccess', component: PaymentSuccessComponent},
  {path: 'admin',
    component: AdminComponent,
    children: [
      { path: 'user', component: UserComponent },
      { path: 'role', component: RoleComponent },
      { path: 'brand', component: BrandComponent },
      { path: 'product', component: ProductComponent },
      { path: 'promotion', component: PromotionComponent },
      { path: 'wareHouse', component: WareHouseComponent },
      { path: 'importProduct', component: ImportProductComponent },
      { path: 'store', component: StoreComponent },
      { path: 'partner', component: PartnerComponent },
      { path: 'classification', component: ClassificationComponent },
      { path: 'category', component: CategoryComponent },
    ]},
    {path: 'staff',
      component: StaffComponent,
      children: [
        { path: 'order/:status', component: OrderComponent },
      ]},
  { path: '**', redirectTo: '', pathMatch: 'full' }, 
];
