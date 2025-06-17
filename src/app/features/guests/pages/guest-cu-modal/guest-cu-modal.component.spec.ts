import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestCuModalComponent } from './guest-cu-modal.component';

describe('GuestCuModalComponent', () => {
  let component: GuestCuModalComponent;
  let fixture: ComponentFixture<GuestCuModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestCuModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestCuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
