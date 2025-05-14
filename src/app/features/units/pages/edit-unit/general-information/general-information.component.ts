import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {noNumbersValidator} from "../../../../../shared/validators/no-number.validator";
import {
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from "@coreui/angular";
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from "ngx-intl-tel-input";
import {TranslatePipe} from "@ngx-translate/core";
import {CountrySelectComponent} from "../../../../../shared/components/country-select/country-select.component";
import {GoogleMapsModule} from "@angular/google-maps";
import {UnitApiService} from "../../../services/unit-api.service";
import {combineLatest, Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {UnitGetModel} from "../../../models/unit-get.model";
import {Icon, icon, latLng, marker, tileLayer} from "leaflet";
import {LeafletModule} from "@bluehalo/ngx-leaflet";
import {IconDirective} from "@coreui/icons-angular";
import {cilLocationPin} from "@coreui/icons";

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
    GoogleMapsModule,
    LeafletModule,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective
  ],
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss'
})
export class GeneralInformationComponent implements OnDestroy {

  infoForm: FormGroup;
  unitId!: string;
  // markers: google.maps.LatLngLiteral[] = [];
  unit!: UnitGetModel;
  icons = {cilLocationPin}

  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18})
    ],
    zoom: 4,
    center: latLng(33.57184, -7.61279)
  };

  layers = [
    marker([33.57184, -7.61279], {
      icon: icon({
        ...Icon.Default.prototype.options,
        iconUrl: 'assets/marker-icon.png',
        iconRetinaUrl: 'assets/marker-icon-2x.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    })
  ];

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
        /*        if (this.unit.address.location) {
                  let lat = this.unit.address.location.lat;
                  let lng = this.unit.address.location.lng;
                  this.markers = [{lat, lng}];
                }*/
      },
      error: (err) => {
        console.error('An error occurred during unit call to retrieve its general information. More info:', err);
        //TODO: launch toast notification and redirect to unit list page
      }
    }))
  }

  setMarker(event: any) {
    console.log('your event is:', event);
    this.layers = [
      marker([event.latlng.lat, event.latlng.lng], {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png'
        })
      })
    ];
    this.infoForm.patchValue({
      latitude: event.latlng.lat,
      longitude: event.latlng.lng
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;
}
