import {Component, OnDestroy} from '@angular/core';
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
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  GutterDirective,
  InputGroupComponent,
  RowComponent
} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {UnitTypeEnum} from "../../../models/unit-type.enum";
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FloorSizeUnitEnum} from "../../../models/floor-size-unit.enum";
import {IconDirective} from "@coreui/icons-angular";
import {cilTrash, cilX} from "@coreui/icons";
import {RoomTypeEnum} from "../../../models/details/room-type.enum";
import {UnitApiService} from "../../../services/unit-api.service";
import {ActivatedRoute} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {combineLatest, Subscription} from "rxjs";
import {BedTypeEnum} from "../../../models/details/bed-type.enum";
import {UnitDetailsGetModel} from "../../../models/details/unit-details-get.model";
import {UnitMapperService} from "../../../services/unit-mapper.service";

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
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    IconDirective,
    CardComponent,
    CardBodyComponent,
    CardTitleDirective,
    NgIf,
    FormFeedbackComponent,
    NgClass
  ],
  templateUrl: './rental-details.component.html',
  standalone: true,
  styleUrl: './rental-details.component.scss'
})
export class RentalDetailsComponent implements OnDestroy {

  icons = {cilTrash, cilX}
  unitTypes = Object.values(UnitTypeEnum);
  roomTypes = Object.values(RoomTypeEnum);
  bedTypes = Object.values(BedTypeEnum);
  floorSizeUnits = Object.values(FloorSizeUnitEnum);
  unitId!: string;
  unit!: UnitDetailsGetModel;

  rentalDetailsForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder, private readonly unitMapperService: UnitMapperService, private readonly unitApiService: UnitApiService,
              private readonly activatedRoute: ActivatedRoute, private readonly toastrService: ToastrService,
              private readonly translateService: TranslateService) {
    this.rentalDetailsForm = this.fb.group({
      type: [null, [Validators.required]],
      floorSize: [null, [Validators.required]],
      floorSizeUnit: [FloorSizeUnitEnum.SQM, [Validators.required]],
      minOccupancy: this.fb.group({
        adults: [1, [Validators.required]],
        children: [0, [Validators.required]],
        infants: [0, [Validators.required]]
      }),
      maxOccupancy: this.fb.group({
        adults: [2, [Validators.required]],
        children: [0, [Validators.required]],
        infants: [0, [Validators.required]]
      }),
      childrenAllowed: [null],
      eventsAllowed: [null],
      smokingAllowed: [null],
      petsAllowed: [null],
      travellerAge: [null],
      description: [null],
      rooms: this.fb.array([
        this.fb.group({
          type: [null, [Validators.required]],
          bathroom: [0, [Validators.required]],
          floorSize: [null],
          beds: this.fb.array([
            this.fb.group({
              type: [null, [Validators.required]],
              quantity: [null, [Validators.required]]
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
      type: [null, [Validators.required]],
      bathroom: [0, [Validators.required]],
      floorSize: [null],
      beds: this.fb.array([
        this.fb.group({
          type: [null, [Validators.required]],
          quantity: [null, [Validators.required]]
        })
      ])
    }));
  }

  removeRoom(index: number) {
    this.rooms.removeAt(index);
  }

  addBed(roomIndex: number) {
    this.roomBeds(roomIndex).push(this.fb.group({
      type: [null, [Validators.required]],
      quantity: [null, [Validators.required]]
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
    let payload = this.unitMapperService.formToDetailsPatchModel(this.rentalDetailsForm.value);
    this.subscriptions.push(this.unitApiService.updateUnitDetailsById(this.unitId, payload).subscribe({
      next: (data) => {
        console.log('Your update api response is:', data);
        this.handleUnitDetailsSuccessResponse(data);
        this.toastrService.info(
          this.translateService.instant('units.edit-unit.tabs.rental-details.notifications.success.message')
            .replace(':rentalName', this.unit.name),
          this.translateService.instant('units.edit-unit.tabs.rental-details.notifications.success.title'));
      },
      error: (err) => {
        console.error('An error occurred when updating unit details with id:', this.unitId, 'More info:', err);
        this.toastrService.warning(
          this.translateService.instant('units.edit-unit.tabs.rental-details.notifications.error.message')
            .replace(':rentalName', this.unit.name),
          this.translateService.instant('units.edit-unit.tabs.rental-details.notifications.error.title'));
      }
    }))
  }

  private retrieveUnitDetails() {
    this.subscriptions.push(this.unitApiService.getUnitDetailsById(this.unitId).subscribe({
      next: (data) => {
        console.log('Unit details call response is:', data);
        this.handleUnitDetailsSuccessResponse(data);
      },
      error: (err) => {
        console.error('An error occurred during unit call to retrieve its details. More info:', err);
      }
    }))
  }

  private handleUnitDetailsSuccessResponse(data: UnitDetailsGetModel) {
    this.unit = data;
    this.rentalDetailsForm.patchValue(this.unit);

    // Patch flat values
    const {
      type,
      floorSize,
      floorSizeUnit,
      minOccupancy,
      maxOccupancy,
      childrenAllowed,
      eventsAllowed,
      smokingAllowed,
      petsAllowed,
      travellerAge,
      description,
      rooms
    } = data;

    this.rentalDetailsForm.patchValue({
      type,
      floorSize,
      floorSizeUnit,
      minOccupancy,
      maxOccupancy,
      childrenAllowed,
      eventsAllowed,
      smokingAllowed,
      petsAllowed,
      travellerAge,
      description
    });

    if (this.unit.rooms.length > 0) {
      this.setRooms(rooms);
    }
  }

  private setRooms(rooms: any[]) {
    const roomsFormArray = new FormArray<FormGroup>([]);
    rooms.forEach(room => {
      const bedsArray = new FormArray<FormGroup>([]);
      (room.beds || []).forEach((bed: { type: any; quantity: any; }) => {
        bedsArray.push(this.fb.group({
          type: [bed.type, [Validators.required]],
          quantity: [bed.quantity, [Validators.required]]
        }));
      });
      const roomGroup = this.fb.group({
        type: [room.type, [Validators.required]],
        bathroom: [room.bathroom, [Validators.required]],
        floorSize: [room.floorSize],
        beds: bedsArray
      });
      roomsFormArray.push(roomGroup);
    });
    this.rentalDetailsForm.setControl('rooms', roomsFormArray);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

}
