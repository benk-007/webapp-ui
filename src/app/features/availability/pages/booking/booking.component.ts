import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { differenceInCalendarDays } from 'date-fns';
import {BookingSource} from "../../models/source.enum";
import {TranslatePipe} from "@ngx-translate/core";
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective, FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from "@coreui/angular";
import {NgForOf} from "@angular/common";
import {
  GuestSelectComponent
} from "../../../../shared/components/guest-select/guest-select.component";
import {GuestModel} from "../../models/guest-model";
import {UnitSelectComponent} from "../../../../shared/components/unit-select/unit-select.component";

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ColComponent,
    RowComponent,
    FormFeedbackComponent,
    FormLabelDirective,
    FormControlDirective,
    FormDirective,
    ButtonDirective,
    NgForOf,
    GuestSelectComponent,
    UnitSelectComponent
  ],
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  bookingForm!: FormGroup;

  total = 0;
  feeAmount = 0;

  constructor(private fb: FormBuilder) {}

  bookingSources = Object.values(BookingSource);

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      guest: [null],
      guestName: ['', Validators.required],
      guestEmail: ['', [Validators.required, Validators.email]],
      guestPhone: [''],
      source: ['', Validators.required],
      adults: ['', [Validators.required, Validators.min(1)]],
      children: [''],

      unit: ['', Validators.required],
      arrive: ['', Validators.required],
      depart: ['', Validators.required],
      baseCharge: ['', Validators.required],
    });

    this.bookingForm.valueChanges.subscribe(() => this.calculateTotal());
  }

  calculateTotal(): void {
    const {
      baseCharge,
      feeRate,
      feeModality,
      adults,
      arrive,
      depart
    } = this.bookingForm.value;

    const nights = this.getNights(arrive, depart);
    let fee = 0;

    if (feeModality === 'PPPN') {
      fee = feeRate * adults * nights;
    } else if (feeModality === 'PN') {
      fee = feeRate * nights;
    } else if (feeModality === 'PP') {
      fee = feeRate * adults;
    }

    this.feeAmount = fee;
    this.total = parseFloat(baseCharge) + fee;
  }

  getNights(start: string, end: string): number {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const nights = differenceInCalendarDays(endDate, startDate);
    return nights > 0 ? nights : 0;
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const bookingPayload = {
      ...this.bookingForm.value,
      total: this.total,
      feeAmount: this.feeAmount,
    };

    console.log('Submitting booking:', bookingPayload);
    // TODO: Send this payload to API
  }

  fillGuestFields(guest: GuestModel | null): void {
    if (guest) {
      this.bookingForm.patchValue({
        guestName: guest.name,
        guestEmail: guest.email,
        guestPhone: guest.phone,
      });

      this.bookingForm.get('guestName')?.disable();
      this.bookingForm.get('guestEmail')?.disable();
      this.bookingForm.get('guestPhone')?.disable();
    } else {
      this.bookingForm.get('guestName')?.enable();
      this.bookingForm.get('guestEmail')?.enable();
      this.bookingForm.get('guestPhone')?.enable();

      this.bookingForm.patchValue({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
      });
    }
  }

}

