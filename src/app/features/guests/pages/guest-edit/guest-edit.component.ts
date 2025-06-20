import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import {
  ButtonDirective, ColComponent, FormControlDirective, FormDirective,
  FormFeedbackComponent, FormLabelDirective, RowComponent, InputGroupComponent, InputGroupTextDirective
} from '@coreui/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { GuestService } from '../../services/guest.service';
import { GuestItemGetModel } from '../../models/guest-item-get.model';
import { GuestItemPatchModel } from '../../models/guest-patch.model';
import { CountrySelectComponent } from '../../../../shared/components/country-select/country-select.component';
import { NgxIntlTelInputModule, CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
import { noNumbersValidator } from '../../../../shared/validators/no-number.validator';
import {PageTitleComponent} from "../../../../shared/components/page-title/page-title.component";
import {TooltipDirective} from "ngx-bootstrap/tooltip";

@Component({
  selector: 'app-guest-edit',
  standalone: true,
  imports: [
    RowComponent, ColComponent, FormControlDirective, FormDirective,
    FormFeedbackComponent, FormLabelDirective, FormsModule,
    ReactiveFormsModule, TranslatePipe, CountrySelectComponent,
    NgxIntlTelInputModule,
    ButtonDirective, RouterOutlet, TooltipDirective
  ],
  templateUrl: './guest-edit.component.html',
  styleUrl: './guest-edit.component.scss'
})
export class GuestEditComponent implements OnDestroy {

  guestForm: FormGroup;
  guestId!: string;
  guest!: GuestItemGetModel;
  isLoading = true;
  private subscriptions: Subscription[] = [];

  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;

  constructor(
    private readonly fb: FormBuilder,
    private readonly guestService: GuestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService
  ) {
    this.guestForm = this.fb.group({
      firstName: [null, [Validators.required, noNumbersValidator()]],
      lastName: [null, [Validators.required, noNumbersValidator()]],
      birthDate: [null],
      address: this.fb.group({
        street1: [null],
        street2: [null],
        postCode: [null],
        city: [null, noNumbersValidator()],
        country: [null]
      }),
      contact: this.fb.group({
        email: [null, [Validators.required]],
        mobile: [null]
      }),
    });

    this.subscriptions.push(
      combineLatest(
        this.activatedRoute.pathFromRoot.map(route => route.paramMap)
      ).subscribe(paramMaps => {
        const guestId = paramMaps
          .map(paramMap => paramMap.get('id'))
          .find(id => id !== null);
        if (guestId) {
          this.guestId = guestId;
          this.retrieveGuest();
        }
      })
    );
  }

  private retrieveGuest() {
    this.subscriptions.push(
      this.guestService.getGuestById(this.guestId).subscribe({
        next: (data) => {
          console.log('Guest loaded successfully:', data);
          this.guest = data;
          this.guestForm.patchValue({
            firstName: this.guest.firstName,
            lastName: this.guest.lastName,
            birthDate: this.guest.birthDate,
            address: this.guest.address,
            contact: this.guest.contact
          });

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load guest:', err);
          this.isLoading = false;
        }
      })
    );
  }

  submit() {
    if (this.guestForm.invalid) {
      this.toastrService.warning(this.translateService.instant('commons.form.validation-errors'));
      return;
    }

    const patchPayload: GuestItemPatchModel = this.guestForm.value;

    this.subscriptions.push(
      this.guestService.patchGuestById(patchPayload, this.guestId).subscribe({
        next: () => {
          console.log('Guest updated successfully.');
          this.toastrService.success(
            this.translateService.instant('guests.edit.notifications.success.message'),
            this.translateService.instant('guests.edit.notifications.success.title')
          );
        },
        error: (err) => {
          console.error('Failed to update guest:', err);
          this.toastrService.error(
            this.translateService.instant('guests.edit.notifications.error.message'),
            this.translateService.instant('guests.edit.notifications.error.title')
          );
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
