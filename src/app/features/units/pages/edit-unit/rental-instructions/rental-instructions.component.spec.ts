import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalInstructionsComponent } from './rental-instructions.component';

describe('RentalInstructionsComponent', () => {
  let component: RentalInstructionsComponent;
  let fixture: ComponentFixture<RentalInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalInstructionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
