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
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  RowComponent
} from "@coreui/angular";
import {TranslatePipe} from "@ngx-translate/core";
import {JsonPipe, NgForOf, NgIf} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {RoomTypeEnum} from "../../../models/rooms-bedding/room-type.enum";
import {RoomSubTypeEnum} from "../../../models/rooms-bedding/room-sub-type.enum";
import {FloorSizeUnitEnum} from "../../../models/floor-size-unit.enum";
import {Subscription} from "rxjs";
import {RoomGetModel} from "../../../models/rooms-bedding/room-get.model";
import {IconDirective} from "@coreui/icons-angular";
import {cilPlus, cilTrash, cilX} from "@coreui/icons";
import {BedTypeEnum} from "../../../models/rooms-bedding/bed-type.enum";

@Component({
  selector: 'app-rooms-bedding',
  imports: [
    ColComponent,
    RowComponent,
    ButtonDirective,
    CardComponent,
    CardBodyComponent,
    CardTitleDirective,
    TranslatePipe,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
    NgForOf,
    ReactiveFormsModule,
    FormDirective,
    JsonPipe,
    FormFeedbackComponent,
    DropdownComponent,
    DropdownItemDirective,
    DropdownMenuDirective,
    DropdownToggleDirective,
    InputGroupComponent,
    IconDirective,
    NgIf
  ],
  templateUrl: './rooms-bedding.component.html',
  standalone: true,
  styleUrl: './rooms-bedding.component.scss'
})
export class RoomsBeddingComponent implements OnDestroy {

  icons = {cilTrash, cilX, cilPlus}
  roomsForm: FormGroup;
  roomTypes = Object.values(RoomTypeEnum);
  bedTypes = Object.values(BedTypeEnum);
  livingTypes = [RoomSubTypeEnum.LIVING_ROOM, RoomSubTypeEnum.BED_IN_LIVING_ROOM];
  bedroomTypes = [RoomSubTypeEnum.MASTER, RoomSubTypeEnum.CHILDREN, RoomSubTypeEnum.GUEST];
  kitchenTypes = [RoomSubTypeEnum.FULL, RoomSubTypeEnum.KITCHENETTE];
  bathroomTypes = [RoomSubTypeEnum.FULL, RoomSubTypeEnum.THREE_QUARTER, RoomSubTypeEnum.HALF, RoomSubTypeEnum.QUARTER];
  floorSizeUnits = Object.values(FloorSizeUnitEnum);
  bathrooms: RoomGetModel[] = [];
  subscriptions: Subscription[] = []

  constructor(private readonly fb: FormBuilder) {
    this.roomsForm = this.createForm();
    this.addRoom();
  }

  addRoom() {
    const room = this.fb.group({
      name: [null, [Validators.required]],
      type: [null, [Validators.required]],
      subType: [null, [Validators.required]],
      floorSize: [null, [Validators.required]],
      floorSizeUnit: [FloorSizeUnitEnum.SQM, [Validators.required]],
      bathroom: [null],
      description: [null],
      beds: this.fb.array([])
    });
    this.subscriptions.push(room.get('type')!.valueChanges.subscribe(type => {
      const subTypeControl = room.get('subType');
      const bedsControl = room.get('beds') as FormArray;
      subTypeControl?.setValue(null);
      if (type === 'GENERAL') {
        subTypeControl!.clearValidators();
      } else {
        subTypeControl!.setValidators(Validators.required);
      }
      subTypeControl!.updateValueAndValidity();

      if (type === 'BEDROOM' || (type === 'LIVING' && subTypeControl?.value && subTypeControl?.value == 'BED_IN_LINVING_ROOM')) {
        bedsControl.clear();
        bedsControl.push(this.fb.group({
          type: [null, [Validators.required]],
          quantity: [1, [Validators.required]]
        }))
      } else {
        bedsControl.clear();
      }
    }))
    this.rooms.push(room);
  }

  removeRoom(index: number) {
    this.rooms.removeAt(index);
  }

  roomBeds(index: number): FormArray {
    return this.rooms.at(index).get('beds') as FormArray;
  }

  addBed(roomIndex: number) {
    this.roomBeds(roomIndex).push(this.fb.group({
      type: [null, [Validators.required]],
      quantity: [1, [Validators.required]]
    }));
  }

  removeBed(roomIndex: number, bedIndex: number) {
    this.roomBeds(roomIndex).removeAt(bedIndex);
  }


  getRoomSubTypes(type: string) {
    if (type == 'BEDROOM') {
      return this.bedroomTypes;
    } else if (type == 'KITCHEN') {
      return this.kitchenTypes;
    } else if (type == 'LIVING') {
      return this.livingTypes;
    } else if (type == 'BATHROOM') {
      return this.bathroomTypes;
    } else {
      return [];
    }
  }

  get rooms(): FormArray {
    return this.roomsForm.get('rooms') as FormArray;
  }

  submit() {

  }

  setFloorSizeUnit(floorSizeUnit: string, roomIndex: number) {
    this.rooms.at(roomIndex).get('floorSizeUnit')?.setValue(floorSizeUnit);
  }

  private createForm() {
    return this.fb.group({
      rooms: this.fb.array([])
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }
}
