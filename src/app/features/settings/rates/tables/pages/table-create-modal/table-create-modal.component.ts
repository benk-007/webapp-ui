import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent,
} from '@coreui/angular';

import { CommonModule } from '@angular/common';
import { TableService } from '../../services/table.service';
import {minMaxStayValidator} from "../../../../../../shared/validators/min-max-stay.validator";
import {pricingConsistencyValidator} from "../../../../../../shared/validators/pricing-consistency.validator";
import {NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent} from "@ng-select/ng-select";
import {IconDirective} from "@coreui/icons-angular";
import {
  cilClock,
  cilPen,
  cilSearch,
  cilSortAscending,
  cilSortDescending,
  cilSwapVertical,
  cilTrash
} from "@coreui/icons";

@Component({
  selector: 'app-table-create-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    TranslatePipe,
    CommonModule,
    NgSelectComponent,
    IconDirective,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
  ],
  templateUrl: './table-create-modal.component.html',
  styleUrl: './table-create-modal.component.scss'
})
export class TableCreateModalComponent implements OnInit, OnDestroy {

  tableForm: FormGroup;

  @Output() actionConfirmed = new EventEmitter<void>();

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly tableService: TableService,
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
      validators: [
        minMaxStayValidator(),
        pricingConsistencyValidator()
      ]
    });
  }

  ngOnInit(): void {}

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
    { label: 'Monday', value: 'MONDAY' },
    { label: 'Tuesday', value: 'TUESDAY' },
    { label: 'Wednesday', value: 'WEDNESDAY' },
    { label: 'Thursday', value: 'THURSDAY' },
    { label: 'Friday', value: 'FRIDAY' },
    { label: 'Saturday', value: 'SATURDAY' },
    { label: 'Sunday', value: 'SUNDAY' }
  ];
  icons = {
    cilTrash
  };


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
    console.log('your payload is:', payload);

    this.subscriptions.push(this.tableService.postTable(payload).subscribe({
      next: () => {
        this.actionConfirmed.emit();
        this.closeModal();
        const msg = this.translateService.instant('tables.create.form.notifications.success.message');
        const title = this.translateService.instant('tables.create.form.notifications.success.title');
        this.toastrService.info(msg, title);
      },
      error: (err) => {
        console.error('Error while creating table:', err);
        this.toastrService.error(
          this.translateService.instant('tables.create.form.notifications.error.message'),
          this.translateService.instant('tables.create.form.notifications.error.title')
        );
      }
    }));
  }

  closeModal(): void {
    this.modalRef.hide();
    this.tableForm.reset();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
