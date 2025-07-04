import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestSelectComponentComponent } from './guest-select.component';

describe('GuestSelectComponentComponent', () => {
  let component: GuestSelectComponentComponent;
  let fixture: ComponentFixture<GuestSelectComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestSelectComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestSelectComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
