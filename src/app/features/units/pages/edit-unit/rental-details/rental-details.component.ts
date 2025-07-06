import {Component, isSignal, OnDestroy} from '@angular/core';
import {
  ButtonDirective,
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
  InputGroupTextDirective,
  RowComponent
} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {UnitTypeEnum} from "../../../models/unit-type.enum";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FloorSizeUnitEnum} from "../../../models/floor-size-unit.enum";
import {IconDirective} from "@coreui/icons-angular";
import {cilSearch, cilTrash, cilX} from "@coreui/icons";
import {UnitApiService} from "../../../services/unit-api.service";
import {ActivatedRoute} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, skip, Subscription} from "rxjs";
import {UnitDetailsGetModel} from "../../../models/details/unit-details-get.model";
import {UnitMapperService} from "../../../services/unit-mapper.service";
import {AmenityEnum} from "../../../models/details/amenity.enum";
import {filter, map, tap} from "rxjs/operators";

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
    FormFeedbackComponent,
    NgClass,
    InputGroupTextDirective,
    NgIf
  ],
  templateUrl: './rental-details.component.html',
  standalone: true,
  styleUrl: './rental-details.component.scss'
})
export class RentalDetailsComponent implements OnDestroy {

  icons = {cilTrash, cilX, cilSearch}
  unitTypes = Object.values(UnitTypeEnum);
  sortedAmenities: { key: string, label: string }[] = [];
  filteredAmenities: { key: string, label: string }[] = [];
  floorSizeUnits = Object.values(FloorSizeUnitEnum);
  unitId!: string;
  unit!: UnitDetailsGetModel;
  rentalDetailsForm!: FormGroup;
  basicSearch: string = '';
  private readonly $basicSearchSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder, private readonly unitMapperService: UnitMapperService, private readonly unitApiService: UnitApiService,
              private readonly activatedRoute: ActivatedRoute, private readonly toastrService: ToastrService,
              private readonly translateService: TranslateService) {
    this.translateService.get('commons.amenities').subscribe((amenities: { [key: string]: string }) => {
      this.sortedAmenities = Object.keys(AmenityEnum).map((key) => ({
        key: AmenityEnum[key as keyof typeof AmenityEnum],
        label: amenities[key] ?? key
      })).sort((a, b) => a.label.localeCompare(b.label))
      this.filteredAmenities = this.sortedAmenities;
      this.createForm();
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
    this.subscribeToBasicSearch();
  }

  setAmenity(event: Event, amenityKey: string) {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked; // for checkbox
    this.rentalDetailsForm.get('amenities')?.get(amenityKey)?.setValue(isChecked);
  }

  setFloorSizeUnit(floorSizeUnit: string) {
    this.rentalDetailsForm.patchValue({
      floorSizeUnit: floorSizeUnit
    })
  }

  triggerBasicSearch(event: Event) {
    let value = (event.target as HTMLInputElement)?.value;
    if (value) {
      value = value.trim();
    }
    console.log('Triggering basic search with value:', value);  // Add this log
    this.$basicSearchSubject.next(value);
  }

  submit() {
    let payload = this.unitMapperService.formToDetailsPatchModel(this.rentalDetailsForm.value, this.rentalDetailsForm.get('amenities')!.value);
    this.subscriptions.push(this.unitApiService.updateUnitDetailsById(this.unitId, payload).subscribe({
      next: (data) => {
        console.log('Your update api response is:', data);
        this.handleUnitDetailsSuccessResponse(data);
        this.toastrService.info(
          this.translateService.instant('units.edit-unit.tabs.detail-information.notifications.success.message')
            .replace(':rentalName', this.unit.name),
          this.translateService.instant('units.edit-unit.tabs.detail-information.notifications.success.title'));
      },
      error: (err) => {
        console.error('An error occurred when updating unit details with id:', this.unitId, 'More info:', err);
        this.toastrService.warning(
          this.translateService.instant('units.edit-unit.tabs.detail-information.notifications.error.message')
            .replace(':rentalName', this.unit.name),
          this.translateService.instant('units.edit-unit.tabs.detail-information.notifications.error.title'));
      }
    }))
  }

  private subscribeToBasicSearch(): void {
    this.subscriptions.push(
      this.$basicSearchSubject.pipe(
        skip(1),
        debounceTime(300),
        distinctUntilChanged(),
        filter(value => value !== null),
        tap(value => {
          if (value) {
            this.basicSearch = value;
          }
        }),
        map(searchTerm => {
          const term = searchTerm?.toLowerCase() || '';
          return this.sortedAmenities.filter(
            (obj) => obj.label.toLowerCase().includes(term)
          );
        })
      ).subscribe(filtered => {
        this.filteredAmenities = filtered;
      })
    );
  }


  private createForm() {
    this.rentalDetailsForm = this.fb.group({
      type: [null, [Validators.required]],
      floorSize: [null],
      floorSizeUnit: [FloorSizeUnitEnum.SQM],
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
      amenities: this.fb.group(
        Object.fromEntries(
          this.sortedAmenities.map(value => [value.key, new FormControl(false)])
        )
      )
    });
  }

  private retrieveUnitDetails() {
    this.subscriptions.push(this.unitApiService.getUnitDetailsById(this.unitId).subscribe({
      next: (data) => {
        console.log('Unit details call response is:', data);
        this.handleUnitDetailsSuccessResponse(data);
        if (this.unit.nature == 'MULTI_UNIT') {
          this.rentalDetailsForm.get('floorSize')?.disable();
          this.rentalDetailsForm.get('floorSizeUnit')?.disable();
        } else {
          if (this.unit.parent) {
            this.rentalDetailsForm.get('type')?.disable();
          }
        }
      },
      error: (err) => {
        console.error('An error occurred during unit call to retrieve its details. More info:', err);
      }
    }))
  }

  get isSubUnit() {
    return this.unit.parent != null;
  }

  private handleUnitDetailsSuccessResponse(data: UnitDetailsGetModel) {
    this.unit = data;


    const {amenities, ...unitDetailsWithoutAmenities} = data;
    this.rentalDetailsForm.patchValue(unitDetailsWithoutAmenities);
    const amenitiesGroup = this.rentalDetailsForm.get('amenities') as FormGroup;
    for (const amenity of this.unit.amenities) {
      if (amenitiesGroup.controls[amenity]) {
        amenitiesGroup.controls[amenity].setValue(true);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  protected readonly isSignal = isSignal;
}
