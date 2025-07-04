import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ButtonDirective, ColComponent, FormControlDirective, FormDirective, FormFeedbackComponent, FormLabelDirective, RowComponent} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

import {ToastrService} from "ngx-toastr";
import {RateApiService} from "../../../../services/rate-api.service";
import {RatesModel} from "../../../../models/rates/rates.model";
import {minMaxStayValidator} from "../../../../../../shared/validators/min-max-stay.validator";
import {pricingConsistencyValidator} from "../../../../../../shared/validators/pricing-consistency.validator";

@Component({
  selector: 'app-rates-settings',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    ReactiveFormsModule,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    TranslatePipe
  ],
  templateUrl: './rates-settings.component.html',
  styleUrl: './rates-settings.component.scss'
})
export class RatesSettingsComponent implements OnInit, OnDestroy {

  unitId!: string;
  ratesForm: FormGroup;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly route: ActivatedRoute,
              private readonly fb: FormBuilder,
              private readonly RateApiService: RateApiService,
              private readonly translateService: TranslateService,
              private readonly toastrService: ToastrService) {

    this.ratesForm = this.fb.group({
      rentalBaseRate: this.fb.group({
        nightly: [null, [Validators.required, Validators.min(1)]],
        weekendNight: [null, [Validators.min(1)]],
        weekly: [null, [Validators.min(1)]],
        monthly: [null, [Validators.min(1)]],
        minStay: [null, [Validators.required, Validators.min(1)]],
        maxStay: [null, [Validators.min(1)]],
      }),
      additionalGuestFee: this.fb.group({
        feePPPN: [null, [Validators.min(1)]],
        guestCount: [null, [Validators.min(1)]],
      }),
    }, {
      validators: [
        minMaxStayValidator(),
        pricingConsistencyValidator()
      ]
    });
  }

  ngOnInit(): void {
    this.unitId = this.route.parent?.parent?.snapshot.params['unitId'];

    this.subscriptions.push(
      this.RateApiService.getUnitRatesById(this.unitId).subscribe({
        next: (rates: RatesModel) => {
          console.log('Rates loaded:', rates);
          this.ratesForm.patchValue(rates);
        },
        error: () => {
          this.toastrService.warning(
            this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.load-error.message'),
            this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.load-error.title'));
        }
      })
    );
  }

  submit() {
    if (this.ratesForm.invalid) {
      this.ratesForm.markAllAsTouched();
      return;
    }

    const payload: RatesModel = this.ratesForm.value;
    console.log(payload)

    this.subscriptions.push(
      this.RateApiService.patchUnitRatesById(this.unitId, payload).subscribe({
        next: (res: RatesModel) => {
          this.toastrService.info(
            this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.success.message'),
            this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.success.title'));
        },
        error: (err) => {
          console.error('Error updating rates:', err);
          this.toastrService.error(
            this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.error.message'),
            this.translateService.instant('units.edit-unit.tabs.rates.settings.notifications.error.title'));
        }
      })
    );
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
