import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsBeddingComponent } from './rooms-bedding.component';

describe('RoomsBeddingComponent', () => {
  let component: RoomsBeddingComponent;
  let fixture: ComponentFixture<RoomsBeddingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsBeddingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomsBeddingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
