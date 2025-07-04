import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {RateApiService} from "../../../../../services/rate-api.service";
import {RatesTableGetModel} from "../../../../../models/rates/rates-table-get.model";
import {minMaxStayValidator} from "../../../../../../../shared/validators/min-max-stay.validator";
import {pricingConsistencyValidator} from "../../../../../../../shared/validators/pricing-consistency.validator";
import {dateRangeValidator} from "../../../../../../../shared/validators/date-range.validator";
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from "@coreui/angular";
import {cilTrash} from "@coreui/icons";
import {IconDirective} from "@coreui/icons-angular";
import {NgSelectComponent} from "@ng-select/ng-select";

@Component({
  selector: 'app-table-cu-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    TranslatePipe,
    RowComponent,
    ColComponent,
    FormLabelDirective,
    FormControlDirective,
    FormFeedbackComponent,
    IconDirective,
    ButtonDirective,
    FormDirective,
    NgSelectComponent,

  ],
  templateUrl: './table-cu-modal.component.html',
  styleUrl: './table-cu-modal.component.scss'
})
export class TableCuModalComponent implements OnInit, OnDestroy {
  loggerHead: string = '[Rates Table CU Modal] - ';
  icons = {cilTrash};
  unitId!: string;
  ratesTableId!: string;
  ratesTableToEdit!: RatesTableGetModel;
  ratesTableForm: FormGroup;
  daysOfWeekOptions = [
    {label: 'Monday', value: 'MONDAY'},
    {label: 'Tuesday', value: 'TUESDAY'},
    {label: 'Wednesday', value: 'WEDNESDAY'},
    {label: 'Thursday', value: 'THURSDAY'},
    {label: 'Friday', value: 'FRIDAY'},
    {label: 'Saturday', value: 'SATURDAY'},
    {label: 'Sunday', value: 'SUNDAY'}
  ];
  @Output() actionConfirmed = new EventEmitter<void>();
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder,
              private readonly modalRef: BsModalRef,
              private readonly rateApiService: RateApiService,
              private readonly translateService: TranslateService,
              private readonly toastrService: ToastrService) {
    this.ratesTableForm = this.fb.group({
      name: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      rate: this.fb.group({
        basePricing: this.fb.group({
          nightly: [null, [Validators.required, Validators.min(1)]],
          weekendNight: [null, [Validators.min(1)]],
          weekly: [null, [Validators.min(1)]],
          monthly: [null, [Validators.min(1)]],
          minStay: [null, [Validators.required, Validators.min(1)]],
          maxStay: [null, [Validators.min(1)]]
        }),
        additionalGuestFee: this.fb.group({
          feePpPn: [null, [Validators.min(1)]],
          guestCount: [null, [Validators.min(1)]]
        })
      }),
      daySpecificPrices: this.fb.array([])
    }, {
      validators: [minMaxStayValidator(), pricingConsistencyValidator(), dateRangeValidator()]
    })
  }

  ngOnInit(): void {
    console.info('Unit Id:', this.unitId, 'Rates Table Id:', this.ratesTableId);
    if (this.ratesTableId) {
      console.debug('Rates table modal opened with edit mode. Rates table Id:', this.ratesTableId);
      this.retrieveRatesTableById();
    } else {
      console.debug('Rates table modal opened with creation mode');
    }
  }

  private retrieveRatesTableById() {
    console.debug('Retrieving Rates Table with Id:', this.ratesTableId);
    this.subscriptions.push(this.rateApiService.getRatesTableById(this.ratesTableId).subscribe({
      next: (res) => {
        this.ratesTableToEdit = res;
        this.ratesTableForm.patchValue({
          name: this.ratesTableToEdit.name,
          startDate: this.ratesTableToEdit.startDate,
          endDate: this.ratesTableToEdit.endDate,
          rate: this.ratesTableToEdit.rate
        });
        if (this.ratesTableToEdit.daySpecificPrices) {
          this.ratesTableToEdit.daySpecificPrices.forEach(daySpecificPrice => {
            const group = this.buildDaySpecificPricesGroup();
            group.patchValue(daySpecificPrice);
            this.daySpecificPrices.push(group);
          })
        }
      },
      error: (err) => {
        console.error('[Rates Table CU Modal] - An error occurred when retrieving Rates table By Id:', this.ratesTableId, 'Error API response:', err);
      }
    }))
  }

  private buildDaySpecificPricesGroup(): FormGroup {
    return this.fb.group({
      nightly: [null, [Validators.required, Validators.min(1)]],
      ppPn: [null, [Validators.min(1)]],
      guestCount: [null, [Validators.min(1)]],
      daysOfWeek: [[], [Validators.required]]
    });
  }

  get daySpecificPrices() {
    return this.ratesTableForm.get('daySpecificPrices') as FormArray;
  }

  addDaySpecificPricing(): void {
    this.daySpecificPrices.push(this.buildDaySpecificPricesGroup());
  }

  removeDaySpecificPricing(index: number): void {
    this.daySpecificPrices.removeAt(index);
  }

  submit() {
    const formValue = this.ratesTableForm.value;
    let payload: any = {
      name: formValue.name,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      rate: formValue.rate,
      daySpecificPrices: formValue.daySpecificPrices
    }

    if (this.ratesTableId) {
      this.subscriptions.push(this.rateApiService.patchRatesTableById(payload, this.ratesTableId).subscribe({
        next: (res) => {
          console.info(this.loggerHead.concat('Rates Table updated successfully. API response:'), res);
          this.actionConfirmed.emit();
          this.modalRef.hide();
          this.toastrService.info(this.translateService.instant('tables.cu-modal.notifications.edit.success.message'),
            this.translateService.instant('tables.cu-modal.notifications.edit.success.title'));
        },
        error: (err) => {
          console.error(this.loggerHead.concat('Error occurred during Rates Table update. Error API response:'), err);
          this.toastrService.error(this.translateService.instant('tables.cu-modal.notifications.edit.error.message'),
            this.translateService.instant('tables.cu-modal.notifications.edit.error.title'));
        }
      }))
    } else {
      payload = {...payload, unitId: this.unitId}
      this.subscriptions.push(this.rateApiService.postRatesTable(payload).subscribe({
        next: (res) => {
          console.info(this.loggerHead.concat('Rates Table created successfully. API response:'), res);
          this.actionConfirmed.emit();
          this.modalRef.hide();
          this.toastrService.success(this.translateService.instant('tables.cu-modal.notifications.create.success.message'),
            this.translateService.instant('tables.cu-modal.notifications.create.success.title'));
        },
        error: (err) => {
          console.error(this.loggerHead.concat('Error occurred during Rates Table creation. Error API response:'), err);
          this.toastrService.error(this.translateService.instant('tables.cu-modal.notifications.create.error.message'),
            this.translateService.instant('tables.cu-modal.notifications.create.error.title'));
        }
      }))
    }
  }

  closeModal() {
    this.modalRef.hide();
  }

  /*

    tableToEdit?: TableItemGetModel;
    unitId!: string;
    tableForm: FormGroup;

    constructor(
      private readonly fb: FormBuilder,
      private readonly rateApiService: RateApiService,
      private readonly modalRef: BsModalRef,
      private readonly translateService: TranslateService,
      private readonly toastrService: ToastrService
    ) {
      this.tableForm = this.fb.group({
        rateName: [null, [Validators.required]],
        fromDate: [null, [Validators.required]],
        untilDate: [null, [Validators.required]],
        rentalBaseRate: this.fb.group({
          nightly: [null, [Validators.required, Validators.min(1)]],
          weekendNight: [null, [Validators.min(1)]],
          weekly: [null, [Validators.min(1)]],
          monthly: [null, [Validators.min(1)]],
          minStay: [null, [Validators.required, Validators.min(1)]],
          maxStay: [null, [Validators.min(1)]]
        }),
        additionalGuestFee: this.fb.group({
          feePPPN: [null, [Validators.min(1)]],
          guestCount: [null, [Validators.min(1)]]
        }),
        daySpecificPricings: this.fb.array([])
      }, {
        validators: [minMaxStayValidator(), pricingConsistencyValidator(), dateRangeValidator()]
      });
    }

    ngOnInit(): void {
      console.log('Unit ID received:', this.unitId);
      if (this.tableToEdit) {
        this.tableForm.patchValue({
          rateName: this.tableToEdit.rateName,
          fromDate: this.tableToEdit.fromDate,
          untilDate: this.tableToEdit.untilDate,
          rentalBaseRate: this.tableToEdit.rate.rentalBaseRate,
          additionalGuestFee: this.tableToEdit.rate.additionalGuestFee
        });

        if (this.tableToEdit.daySpecificPricings) {
          this.tableToEdit.daySpecificPricings.forEach(pricing => {
            const group = this.buildDaySpecificPricingGroup();
            group.patchValue(pricing);
            this.daySpecificPricings.push(group);
          });
        }
      }
    }

    private buildDaySpecificPricingGroup(): FormGroup {
      return this.fb.group({
        nightly: [null, [Validators.required, Validators.min(1)]],
        ppPn: [null, [Validators.min(1)]],
        guestCount: [null, [Validators.min(1)]],
        daysOfWeek: [[], [Validators.required]]
      });
    }

    get daySpecificPricings() {
      return this.tableForm.get('daySpecificPricings') as FormArray;
    }

    addDaySpecificPricing(): void {
      this.daySpecificPricings.push(this.buildDaySpecificPricingGroup());
    }

    removeDaySpecificPricing(index: number): void {
      this.daySpecificPricings.removeAt(index);
    }

    daysOfWeekOptions = [
      {label: 'Monday', value: 'MONDAY'},
      {label: 'Tuesday', value: 'TUESDAY'},
      {label: 'Wednesday', value: 'WEDNESDAY'},
      {label: 'Thursday', value: 'THURSDAY'},
      {label: 'Friday', value: 'FRIDAY'},
      {label: 'Saturday', value: 'SATURDAY'},
      {label: 'Sunday', value: 'SUNDAY'}
    ];

    icons = {cilTrash};

    submit(): void {
      const formValue = this.tableForm.value;

      const payload = {
        rateName: formValue.rateName,
        fromDate: formValue.fromDate,
        untilDate: formValue.untilDate,
        rate: {
          rentalBaseRate: formValue.rentalBaseRate,
          additionalGuestFee: formValue.additionalGuestFee
        },
        daySpecificPricings: formValue.daySpecificPricings
      };

      if (!this.tableToEdit) {
        // Creation
        this.subscriptions.push(
          this.tableService.postTable(payload, this.unitId).subscribe({
            next: () => {
              this.actionConfirmed.emit();
              this.closeModal();
              const msg = this.translateService.instant('tables.create.form.notifications.success.message');
              const title = this.translateService.instant('tables.create.form.notifications.success.title');
              this.toastrService.success(msg, title);
            },
            error: (err) => {
              console.error('Error creating table:', err);
              this.toastrService.error(
                this.translateService.instant('tables.create.form.notifications.error.message'),
                this.translateService.instant('tables.create.form.notifications.error.title')
              );
            }
          })
        );
      } else {
        // Edition
        const rateId = this.tableToEdit.id;
        this.subscriptions.push(
          this.tableService.patchTableById(payload, rateId).subscribe({
            next: () => {
              this.actionConfirmed.emit();
              this.closeModal();
              const msg = this.translateService.instant('tables.edit.form.notifications.success.message');
              const title = this.translateService.instant('tables.edit.form.notifications.success.title');
              this.toastrService.info(msg, title);
            },
            error: (err) => {
              console.error('Error updating table:', err);
              this.toastrService.error(
                this.translateService.instant('tables.edit.form.notifications.error.message'),
                this.translateService.instant('tables.edit.form.notifications.error.title')
              );
            }
          })
        );
      }
    }

    closeModal(): void {
      this.modalRef.hide();
      this.tableForm.reset();
    }
  */

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


}
