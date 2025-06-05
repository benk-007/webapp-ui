import {Component} from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  GutterDirective,
  InputGroupComponent,
  RowComponent
} from "@coreui/angular";
import {TranslatePipe} from "@ngx-translate/core";
import {UnitTypeEnum} from "../../../models/unit-type.enum";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {JsonPipe, NgForOf} from "@angular/common";
import {FloorSizeUnitEnum} from "../../../models/floor-size-unit.enum";

@Component({
  selector: 'app-rental-details',
  imports: [
    RowComponent,
    ColComponent,
    FormSelectDirective,
    TranslatePipe,
    FormControlDirective,
    FormLabelDirective,
    InputGroupComponent,
    DropdownComponent,
    ButtonDirective,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    NgForOf,
    FormsModule,
    GutterDirective,
    ReactiveFormsModule,
    JsonPipe,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective
  ],
  templateUrl: './rental-details.component.html',
  standalone: true,
  styleUrl: './rental-details.component.scss'
})
export class RentalDetailsComponent {

  unitTypes = Object.values(UnitTypeEnum);
  floorSizeUnits = Object.values(FloorSizeUnitEnum);

  rentalDetailsForm: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.rentalDetailsForm = this.fb.group({
      type: [null],
      floorSize: [null],
      floorSizeUnit: [FloorSizeUnitEnum.SQM],
      minOccupancy: this.fb.group({
        adults: [1],
        children: [0],
        infants: [0]
      }),
      maxOccupancy: this.fb.group({
        adults: [2],
        children: [0],
        infants: [0]
      })
    })
  }

  setFloorSizeUnit(floorSizeUnit: string) {
    this.rentalDetailsForm.patchValue({
      floorSizeUnit: floorSizeUnit
    })
  }

  submit() {

  }
}
