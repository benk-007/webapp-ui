import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from '@coreui/angular';

import { GuestService } from '../../services/guest.service';
import { GuestItemPostModel } from '../../models/guest-post.model';
import { GuestItemPatchModel } from '../../models/guest-patch.model';
import { GuestItemGetModel } from '../../models/guest-item-get.model';
import { CountrySelectComponent } from '../../../../shared/components/country-select/country-select.component';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-guest-cu-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    TranslatePipe,
    CountrySelectComponent,
    CommonModule
  ],
  templateUrl: './guest-cu-modal.component.html',
  styleUrl: './guest-cu-modal.component.scss'
})
export class GuestCuModalComponent implements OnInit, OnDestroy {
  guestToEdit?: GuestItemGetModel;
  guestForm: FormGroup;
  @Output() actionConfirmed = new EventEmitter<string>();
  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly guestService: GuestService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.guestForm = this.fb.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      birthDate: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      mobile: [null],
      country: [null, Validators.required],
      city: [null],
      postCode: [null],
      street1: [null],
      street2: [null],
      idDocuments: this.fb.array([])
    });
  }

  get idDocuments(): FormArray {
    return this.guestForm.get('idDocuments') as FormArray;
  }

  addDocument(doc?: { type?: string; documentNumber?: string; expirationDate?: string }): void {
    console.log('Adding document...');
    this.idDocuments.push(this.fb.group({
      type: [doc?.type || null, Validators.required],
      documentNumber: [doc?.documentNumber || '', Validators.required],
      expirationDate: [doc?.expirationDate || null, Validators.required]
    }));
  }

  removeDocument(index: number): void {
    this.idDocuments.removeAt(index);
  }

  ngOnInit(): void {
    if (this.guestToEdit) {
      const { firstName, lastName, birthDate, contact, address } = this.guestToEdit;

      this.guestForm.patchValue({
        firstName,
        lastName,
        birthDate,
        email: contact?.email,
        mobile: contact?.mobile,
        country: address?.country,
        city: address?.city,
        postCode: address?.postCode,
        street1: address?.street1,
        street2: address?.street2
      });

      this.guestToEdit.idDocuments?.forEach(doc => this.addDocument(doc));
    }
  }

  submit(): void {
    const formValue = this.guestForm.value;
    const basePayload = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      birthDate: formValue.birthDate,
      contact: {
        email: formValue.email,
        mobile: formValue.mobile?.e164Number || null
      },
      address: {
        country: formValue.country,
        city: formValue.city,
        postCode: formValue.postCode,
        street1: formValue.street1,
        street2: formValue.street2
      },
      idDocuments: this.idDocuments.value
    };
    console.log('Payload to send:', basePayload);

    if (!this.guestToEdit) {
      // CREATE
      const payload: GuestItemPostModel = basePayload;

      this.subscriptions.push(this.guestService.postGuest(payload).subscribe({
        next: (res) => {
          this.actionConfirmed.emit();
          this.closeModal();
          const name = `${res.firstName} ${res.lastName}`;
          const msg = this.translateService.instant('guests.create.form.notifications.success.message').replace(':name', name);
          const title = this.translateService.instant('guests.create.form.notifications.success.title');
          this.toastrService.success(msg, title);
        },
        error: (err) => {
          console.error('Error while creating guest:', err);
          this.toastrService.error(
            this.translateService.instant('guests.create.form.notifications.error.message'),
            this.translateService.instant('guests.create.form.notifications.error.title')
          );
        }
      }));
    } else {
      // UPDATE
      const payload: GuestItemPatchModel = basePayload;

      this.subscriptions.push(this.guestService.patchGuestById(payload, this.guestToEdit.id).subscribe({
        next: (res) => {
          this.actionConfirmed.emit();
          this.closeModal();
          const name = `${res.firstName} ${res.lastName}`;
          const msg = this.translateService.instant('guests.edit.form.notifications.success.message').replace(':name', name);
          const title = this.translateService.instant('guests.edit.form.notifications.success.title');
          this.toastrService.info(msg, title);
        },
        error: (err) => {
          console.error('Error while editing guest:', err);
          this.toastrService.error(
            this.translateService.instant('guests.edit.form.notifications.error.message'),
            this.translateService.instant('guests.edit.form.notifications.error.title')
          );
        }
      }));
    }
  }

  closeModal(): void {
    this.modalRef.hide();
    this.guestForm.reset();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
