import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WareHouseComponent } from './ware-house.component';

describe('WareHouseComponent', () => {
  let component: WareHouseComponent;
  let fixture: ComponentFixture<WareHouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WareHouseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WareHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
