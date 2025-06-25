import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCreateModalComponent } from './table-create-modal.component';

describe('TableCreateModalComponent', () => {
  let component: TableCreateModalComponent;
  let fixture: ComponentFixture<TableCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
