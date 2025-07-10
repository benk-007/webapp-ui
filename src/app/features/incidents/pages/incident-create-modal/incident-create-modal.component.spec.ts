import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentCreateModalComponent } from './incident-create-modal.component';

describe('IncidentCreateModalComponent', () => {
  let component: IncidentCreateModalComponent;
  let fixture: ComponentFixture<IncidentCreateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentCreateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
