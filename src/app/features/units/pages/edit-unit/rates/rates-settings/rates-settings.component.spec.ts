import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatesSettingsComponent } from './rates-settings.component';

describe('RatesSettingsComponent', () => {
  let component: RatesSettingsComponent;
  let fixture: ComponentFixture<RatesSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatesSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
