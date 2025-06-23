import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {ToastrService} from 'ngx-toastr';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from 'ngx-intl-tel-input';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent,
} from '@coreui/angular';
import {GuestService} from '../../services/guest.service';
import {GuestItemPostModel} from '../../models/guest-post.model';
import {CountrySelectComponent} from '../../../../shared/components/country-select/country-select.component';
import {CommonModule} from '@angular/common';
import {NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent} from "@ng-select/ng-select";
import {DocumentTypeEnum} from "../../models/document-type.enum";
import {documentConsistencyValidator} from "../../validators/document-consistency.validator";

@Component({
  selector: 'app-guest-create-modal',
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
    CommonModule,
    NgSelectComponent,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective
  ],
  templateUrl: './guest-create-modal.component.html',
  styleUrl: './guest-create-modal.component.scss'
})
export class GuestCreateModalComponent implements OnInit, OnDestroy {

  documentTypes = Object.values(DocumentTypeEnum);
  guestForm: FormGroup;
  @Output() actionConfirmed = new EventEmitter<void>();
  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;

  imageFile: File | null = null;

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
      birthDate: [null],
      email: [null, [Validators.required, Validators.email]],
      mobile: [null],
      country: [null],
      city: [null],
      postCode: [null],
      street1: [null],
      street2: [null],
      identityDocument: this.fb.group({
        type: [null],
        value: [null],
        expirationDate: [null],
        documentImage: [null]
      }),
    });
  }

  get idDocumentGroup(): FormGroup {
    return this.guestForm.get('identityDocument') as FormGroup;
  }

  ngOnInit(): void {

  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastrService.error('Please select a valid image file.');
        return;
      }
      this.imageFile = file;
      this.idDocumentGroup.get('documentImage')?.setValue(file);

      this.idDocumentGroup.updateValueAndValidity({onlySelf: true, emitEvent: false});
    }
  }

  submit(): void {
    if (!this.guestForm.valid) {
      const errors = this.guestForm.errors;
      if (errors?.['documentIncomplete']) {
        this.toastrService.error('Please complete all document fields.');
      } else if (errors?.['documentRequiredWithImage']) {
        this.toastrService.error('Please fill document details before uploading an image.');
      } else {
        this.toastrService.error('Form invalid.');
      }
      return;
    }

    const formValue = this.guestForm.value;

    const payload: GuestItemPostModel = {
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
      }
    };
    if (formValue.identityDocument.value) {
      payload.identityDocument = {
        type: formValue.identityDocument.type,
        value: formValue.identityDocument.value,
        expirationDate: formValue.identityDocument.expirationDate
      }
    }


    const formData = new FormData();

    const guestJsonBlob = new Blob([JSON.stringify(payload)], {type: 'application/json'});
    formData.append('payload', guestJsonBlob);

    if (this.imageFile) {
      formData.append('file', this.imageFile);
    }

    // (for debugging)
    formData.forEach((value, key) => {
      console.log(key, value);
    });


    this.subscriptions.push(this.guestService.postGuest(formData).subscribe({
      next: () => {
        this.actionConfirmed.emit();
        this.closeModal();
        const msg = this.translateService.instant('guests.create.form.notifications.success.message');
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
  }

  closeModal(): void {
    this.modalRef.hide();
    this.guestForm.reset();
    this.imageFile = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
