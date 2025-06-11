import { Component } from '@angular/core';
import {ColComponent, FormControlDirective, FormDirective, FormLabelDirective, RowComponent} from "@coreui/angular";
import {TranslatePipe} from "@ngx-translate/core";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgxIntlTelInputModule} from "ngx-intl-tel-input";
import {JsonPipe} from "@angular/common";
import {TimepickerComponent} from "ngx-bootstrap/timepicker";

@Component({
  selector: 'app-rental-checkin',
  imports: [
    RowComponent,
    ColComponent,
    TranslatePipe,
    FormControlDirective,
    FormLabelDirective,
    FormsModule,
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    FormDirective,
    JsonPipe,
    TimepickerComponent
  ],
  templateUrl: './rental-checkin.component.html',
  standalone: true,
  styleUrl: './rental-checkin.component.scss'
})
export class RentalCheckinComponent {

  checkinForm: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.checkinForm = this.fb.group({
      checkIn:[null],
      checkOut:[null],
      timezone:[null]
    })
  }

  submit() {

  }
}
