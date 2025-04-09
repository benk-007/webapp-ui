import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCuModalComponent } from './user-cu-modal.component';

describe('UserCuModalComponent', () => {
  let component: UserCuModalComponent;
  let fixture: ComponentFixture<UserCuModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCuModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
