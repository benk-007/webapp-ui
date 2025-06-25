import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCuModalComponent } from './table-cu-modal.component';

describe('TableCreateModalComponent', () => {
  let component: TableCuModalComponent;
  let fixture: ComponentFixture<TableCuModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCuModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
