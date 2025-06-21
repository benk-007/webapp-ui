import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityDocumentListComponent } from './identity-document-list.component';

describe('IdentityDocumentListComponent', () => {
  let component: IdentityDocumentListComponent;
  let fixture: ComponentFixture<IdentityDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityDocumentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
