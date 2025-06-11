import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalCheckinComponent } from './rental-checkin.component';

describe('RentalCheckinComponent', () => {
  let component: RentalCheckinComponent;
  let fixture: ComponentFixture<RentalCheckinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalCheckinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
