import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ButtonDirective, ColComponent, FormControlDirective, FormDirective, FormFeedbackComponent, FormLabelDirective, RowComponent} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

import {ToastrService} from "ngx-toastr";
import {RateApiService} from "../../../../services/rate-api.service";
import {RatesGetModel} from "../../../../models/rates-get.model";

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
      nightly: [null, [Validators.required]],
      weekendNight: [null],
      weekly: [null],
      monthly: [null],
      minStay: [null],
      maxStay: [null],
      feePPPN: [null],
      guestCount: [null],
    });
  }

  ngOnInit(): void {
    this.unitId = this.route.parent?.parent?.snapshot.params['unitId'];

    this.subscriptions.push(
      this.RateApiService.getUnitRatesById(this.unitId).subscribe({
        next: (rates: RatesGetModel) => {
          console.log('Rates loaded:', rates);
          this.ratesForm.patchValue(rates);
        },
        error: () => {
          this.toastrService.error(this.translateService.instant('rates.settings.load-error'), 'Error');
        }
      })
    );
  }

  submit() {
    if (this.ratesForm.invalid) {
      this.ratesForm.markAllAsTouched();
      return;
    }

    const payload: RatesGetModel = this.ratesForm.value;

    console.log("Submitting rates:", payload);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
