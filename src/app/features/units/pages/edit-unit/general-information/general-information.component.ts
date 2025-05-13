import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {noNumbersValidator} from "../../../../../shared/validators/no-number.validator";
import {
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from "@coreui/angular";
import {NgxIntlTelInputModule} from "ngx-intl-tel-input";
import {TranslatePipe} from "@ngx-translate/core";
import {CountrySelectComponent} from "../../../../../shared/components/country-select/country-select.component";
import {GoogleMap, GoogleMapsModule, MapMarker} from "@angular/google-maps";
import {NgForOf} from "@angular/common";
import {UnitApiService} from "../../../services/unit-api.service";
import {combineLatest, Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {UnitGetModel} from "../../../models/unit-get.model";

@Component({
  selector: 'app-general-information',
  imports: [
    RowComponent,
    ColComponent,
    FormControlDirective,
    FormDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    FormsModule,
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    TranslatePipe,
    CountrySelectComponent,
    GoogleMap,
    MapMarker,
    NgForOf,
    GoogleMapsModule
  ],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss'
})
export class GeneralInformationComponent implements OnDestroy {

  infoForm: FormGroup;
  unitId!: string;
  markers: google.maps.LatLngLiteral[] = [];
  unit!: UnitGetModel;

  mapOptions: google.maps.MapOptions = {
    center: {lat: 33.5731, lng: -7.5898},
    mapId: 'customMap',
    scrollwheel: true,
    disableDoubleClickZoom: true,
    mapTypeId: 'hybrid',
    zoom: 12,
    maxZoom: 18,
    minZoom: 4,
  };

  private subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder, private readonly unitApiService: UnitApiService, private readonly activatedRoute: ActivatedRoute) {
    this.infoForm = this.fb.group({
      name: [null, [Validators.required]],
      subtitle: [null],
      street1: [null, [Validators.required]],
      street2: [null],
      postcode: [null],
      city: [null, [Validators.required, noNumbersValidator()]],
      country: [null, [Validators.required]],
      mobile: [null, [Validators.required]],
      email: [null, [Validators.required]],
      latitude: [null],
      longitude: [null]
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
          this.retrieveUnit();
        }
      })
    );

  }

  submit() {

  }

  setMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      console.log('Selected coordinates:', {lat, lng});
      this.markers = [{lat, lng}];
    }
  }

  private retrieveUnit() {
    this.subscriptions.push(this.unitApiService.getUnitById(this.unitId).subscribe({
      next: (data) => {
        console.log('Unit call general information response is:', data);
        this.unit = data;
        this.infoForm.patchValue(this.unit);
        this.infoForm.patchValue({
          street1: this.unit.address.street1,
          street2: this.unit.address.street2,
          postcode: this.unit.address.postCode,
          city: this.unit.address.city,
          country: this.unit.address.country,
          latitude: this.unit.address.location?.lat,
          longitude: this.unit.address.location?.lng,
          mobile: this.unit.contact.mobile,
          email: this.unit.contact.email
        });
        if (this.unit.address.location) {
          let lat = this.unit.address.location.lat;
          let lng = this.unit.address.location.lng;
          this.markers = [{lat, lng}];
        }
      },
      error: (err) => {
        console.error('An error occurred during unit call to retrieve its general information. More info:', err);
        //TODO: launch toast notification and redirect to unit list page
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

}
