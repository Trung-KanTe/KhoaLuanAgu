import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportProductComponent } from './import-product.component';

describe('ImportProductComponent', () => {
  let component: ImportProductComponent;
  let fixture: ComponentFixture<ImportProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
