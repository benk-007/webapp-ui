import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsCreateModalComponent } from './documents-create-modal.component';

describe('DocumentsCreateModalComponent', () => {
  let component: DocumentsCreateModalComponent;
  let fixture: ComponentFixture<DocumentsCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
