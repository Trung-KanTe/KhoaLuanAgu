import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderReceiptComponent } from './order-receipt.component';

describe('OrderReceiptComponent', () => {
  let component: OrderReceiptComponent;
  let fixture: ComponentFixture<OrderReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderReceiptComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
