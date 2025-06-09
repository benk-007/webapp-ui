import {Component} from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardTitleDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormLabelDirective,
  FormSelectDirective,
  GutterDirective,
  InputGroupComponent,
  RowComponent
} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {UnitTypeEnum} from "../../../models/unit-type.enum";
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {JsonPipe, NgForOf, NgIf} from "@angular/common";
import {FloorSizeUnitEnum} from "../../../models/floor-size-unit.enum";
import {IconDirective} from "@coreui/icons-angular";
import {cilTrash} from "@coreui/icons";
import {RoomTypeEnum} from "../../../models/details/room-type.enum";
import {UnitDetailsGetModel} from "../../../models/details/unit-details.get.model";
import {UnitApiService} from "../../../services/unit-api.service";
import {ActivatedRoute} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {combineLatest, Subscription} from "rxjs";

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
    FormCheckLabelDirective,
    IconDirective,
    CardComponent,
    CardBodyComponent,
    CardTitleDirective,
    NgIf
  ],
  templateUrl: './rental-details.component.html',
  standalone: true,
  styleUrl: './rental-details.component.scss'
})
export class RentalDetailsComponent {

  icons = {cilTrash}
  unitTypes = Object.values(UnitTypeEnum);
  roomTypes = Object.values(RoomTypeEnum);
  floorSizeUnits = Object.values(FloorSizeUnitEnum);
  unitId!: string;
  unit!: UnitDetailsGetModel;

  rentalDetailsForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder, private readonly unitApiService: UnitApiService,
              private readonly activatedRoute: ActivatedRoute, private readonly toastrService: ToastrService,
              private readonly translateService: TranslateService) {
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
      }),
      childrenAllowed: [null],
      eventsAllowed: [null],
      smokingAllowed: [null],
      petsAllowed: [null],
      travellerAge: [null],
      description: [null],
      rooms: this.fb.array([
        this.fb.group({
          type: [null],
          bathroom: [null],
          size: [null],
          beds: this.fb.array([
            this.fb.group({
              type: [null],
              quantity: [null]
            })
          ]),
        })
      ])
    });
    this.subscriptions.push(
      combineLatest(
        this.activatedRoute.pathFromRoot.map(route => route.paramMap)
      ).subscribe(paramMaps => {
        const unitId = paramMaps
          .map(paramMap => paramMap.get('unitId'))
          .find(id => id !== null);
        if (unitId) {
          this.unitId = unitId;
          this.retrieveUnitDetails();
        }
      })
    );
  }

  get rooms(): FormArray {
    return this.rentalDetailsForm.get('rooms') as FormArray;
  }

  roomBeds(index: number): FormArray {
    return this.rooms.at(index).get('beds') as FormArray;
  }

  addRoom() {
    this.rooms.push(this.fb.group({
      type: [null],
      bathroom: [null],
      size: [null],
      beds: this.fb.array([
        this.fb.group({
          type: [null],
          quantity: [null]
        })
      ])
    }));
  }

  removeRoom(index: number) {
    this.rooms.removeAt(index);
  }

  addBed(roomIndex: number) {
    this.roomBeds(roomIndex).push(this.fb.group({
      type: [null],
      quantity: [null]
    }));
  }

  removeBed(roomIndex: number, bedIndex: number) {
    this.roomBeds(roomIndex).removeAt(bedIndex);
  }

  setFloorSizeUnit(floorSizeUnit: string) {
    this.rentalDetailsForm.patchValue({
      floorSizeUnit: floorSizeUnit
    })
  }

  submit() {

  }

  private retrieveUnitDetails() {
    this.subscriptions.push(this.unitApiService.getUnitDetailsById(this.unitId).subscribe({
      next: (data) => {
        console.log('Unit details call response is:', data);
        this.unit = data;
        this.rentalDetailsForm.patchValue(this.unit);
      },
      error: (err) => {
        console.error('An error occurred during unit call to retrieve its details. More info:', err);
        //TODO: launch toast notification and redirect to unit list page
      }
    }))
  }
}
