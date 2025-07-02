import {Component, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {noNumbersValidator} from "../../../../../shared/validators/no-number.validator";
import {
  ButtonDirective,
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
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {CountrySelectComponent} from "../../../../../shared/components/country-select/country-select.component";
import {GoogleMapsModule} from "@angular/google-maps";
import {UnitApiService} from "../../../services/unit-api.service";
import {combineLatest, Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Icon, icon, latLng, marker, tileLayer} from "leaflet";
import {LeafletModule} from "@bluehalo/ngx-leaflet";
import {IconDirective} from "@coreui/icons-angular";
import {cilLocationPin} from "@coreui/icons";
import {NgClass} from "@angular/common";
import {UnitInfosGetModel} from "../../../models/unit-infos-get.model";
import {ToastrService} from "ngx-toastr";
import {GalleryComponent} from "./gallery/gallery.component";

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
    IconDirective,
    NgClass,
    ButtonDirective,
    GalleryComponent
  ],
  templateUrl: './general-information.component.html',
  standalone: true,
  styleUrl: './general-information.component.scss'
})
export class GeneralInformationComponent implements OnDestroy {
  infoForm: FormGroup;
  unitId!: string;
  // markers: google.maps.LatLngLiteral[] = [];
  unit!: UnitInfosGetModel;
  icons = {cilLocationPin}
  readonly calendarColors: string[] = ['#7ad148', '#5484ED', '#A4BDFC', '#46D6DB', '#7AE7BF', '#51B749', '#FBD75B',
    '#FFB878', '#FF887C', '#DC2127', '#DBADFF', '#DDDDDD']
  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;

  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18})
    ],
    zoom: 4,
    center: latLng(33.57184, -7.61279)
  };

  layers!: any;

  //
  isSubUnit: boolean = false;
  parentUnitId?: string;

  private subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder, private readonly unitApiService: UnitApiService,
              private readonly activatedRoute: ActivatedRoute, private readonly toastrService: ToastrService,
              private readonly translateService: TranslateService) {
    this.infoForm = this.fb.group({
      name: [null, [Validators.required]],
      subtitle: [null],
      address: this.fb.group({
        street1: [null, [Validators.required]],
        street2: [null],
        postcode: [null],
        city: [null, [Validators.required, noNumbersValidator()]],
        country: [null, [Validators.required]],
        location: this.fb.group({
          lat: [null],
          lng: [null],
        })
      }),
      contact: this.fb.group({
        mobile: [null, [Validators.required]],
        email: [null, [Validators.required]]
      }),
      calendarColor: [null]
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
    let payload;

    // Ajouter cette condition complète au début :
    if (this.isSubUnit) {
      // Pour les subUnits, on envoie seulement name, subtitle et calendarColor
      payload = {
        name: this.infoForm.value.name,
        subtitle: this.infoForm.value.subtitle,
        calendarColor: this.infoForm.value.calendarColor
      };
    } else {
      // Pour les unités normales, on garde la logique existante
      payload = {
        ...this.infoForm.value,
        contact: {
          mobile: this.infoForm.value.contact.mobile.e164Number
        }
      };
    }

    this.subscriptions.push(this.unitApiService.updateUnitInfosById(this.unitId, payload).subscribe({
      next: (data) => {
        console.log('Unit infos updated successfully. Api response is:', data);
        this.unit = data;
        this.infoForm.patchValue(this.unit);
        if (this.unit.address && this.unit.address.location && this.unit.address.location.lat && this.unit.address.location.lng) {
          this.layers = [
            marker([this.unit.address.location.lat, this.unit.address.location.lng], {
              icon: icon({
                ...Icon.Default.prototype.options,
                iconUrl: 'assets/marker-icon.png',
                iconRetinaUrl: 'assets/marker-icon-2x.png',
                shadowUrl: 'assets/marker-shadow.png'
              })
            })
          ];
        }
        this.toastrService.info(
          this.translateService.instant('units.edit-unit.tabs.general-information.notifications.success.message')
            .replace(':rentalName', this.unit.name),
          this.translateService.instant('units.edit-unit.tabs.general-information.notifications.success.title'));
      },
      error: (err) => {
        console.error('An error occurred during unit infos update. Api response is:', err);
        this.toastrService.warning(
          this.translateService.instant('units.edit-unit.tabs.general-information.notifications.error.message')
            .replace(':rentalName', this.unit.name),
          this.translateService.instant('units.edit-unit.tabs.general-information.notifications.error.title'));
      }
    }))
  }


  private retrieveUnit() {
    this.subscriptions.push(this.unitApiService.getUnitInfosById(this.unitId).subscribe({
      next: (data) => {
        console.log('Unit infos call general information response is:', data);
        this.unit = data;

        //
        this.isSubUnit = !!data.parentUnit;
        this.parentUnitId = data.parentUnit;

        this.infoForm.patchValue(this.unit);
        if (this.unit.address && this.unit.address.location && this.unit.address.location.lat && this.unit.address.location.lng) {
          this.layers = [
            marker([this.unit.address.location.lat, this.unit.address.location.lng], {
              icon: icon({
                ...Icon.Default.prototype.options,
                iconUrl: 'assets/marker-icon.png',
                iconRetinaUrl: 'assets/marker-icon-2x.png',
                shadowUrl: 'assets/marker-shadow.png'
              })
            })
          ];
        }

        //fonction pour désactiver les champs
        this.handleSubUnitFields();

      },
      error: (err) => {
        console.error('An error occurred during unit call to retrieve its general information. More info:', err);
        //TODO: launch toast notification and redirect to unit list page
      }
    }))
  }

  private handleSubUnitFields() {
    if (this.isSubUnit) {
      // Désactiver les champs address et contact pour les subUnits
      this.infoForm.get('address')?.disable();
      this.infoForm.get('contact')?.disable();
      // Désactiver spécifiquement country et location
      this.infoForm.get('address.country')?.disable();
      this.infoForm.get('address.location')?.disable();
    }
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
      address: {
        location: {
          lat: event.latlng.lat,
          lng: event.latlng.lng
        }
      }
    })
  }

  private retrieveUnitImages() {

  }

  selectColor(colorHexCode: string) {
    this.infoForm.patchValue({
      calendarColor: colorHexCode,
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }


}
