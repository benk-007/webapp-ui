import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentGalleryComponent } from './incident-gallery.component';

describe('IncidentGalleryComponent', () => {
  let component: IncidentGalleryComponent;
  let fixture: ComponentFixture<IncidentGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
