import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
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
import {NgSelectComponent} from "@ng-select/ng-select";
import {DocumentTypeEnum} from "../../models/document-type.enum";

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
    NgSelectComponent
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
      birthDate: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      mobile: [null],
      country: [null, Validators.required],
      city: [null],
      postCode: [null],
      street1: [null],
      street2: [null],
      identityDocument: this.fb.group({
        type: [null],
        documentNumber: [''],
        expirationDate: [null]
      }),
      documentImage: [null]
    }, {validators: this.documentConsistencyValidator()});
  }

  get idDocumentGroup(): FormGroup {
    return this.guestForm.get('identityDocument') as FormGroup;
  }

  ngOnInit(): void {
    this.idDocumentGroup.valueChanges.subscribe(() => {
      this.guestForm.updateValueAndValidity({onlySelf: true, emitEvent: false});
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastrService.error('Please select a valid image file.');
        return;
      }
      this.imageFile = file;
      this.guestForm.get('documentImage')?.setValue(file);

      this.guestForm.updateValueAndValidity({onlySelf: true, emitEvent: false});
    }
  }

  private documentConsistencyValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const idDocument = form.get('identityDocument') as FormGroup;
      const type = idDocument.get('type')?.value;
      const number = idDocument.get('documentNumber')?.value;
      const expiration = idDocument.get('expirationDate')?.value;
      const image = this.imageFile;

      const anyDocumentFieldFilled = type || number || expiration;
      const documentIncomplete = (anyDocumentFieldFilled && (!type || !number || !expiration));

      // Rule 1: once user starts filling any document field, all must be filled
      if (documentIncomplete) {
        return {documentIncomplete: true};
      }

      // Rule 2: if image is uploaded, document fields must be fully filled
      if (image && (!type || !number || !expiration)) {
        return {documentRequiredWithImage: true};
      }

      return null;
    };
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
    if(formValue.identityDocument.documentNumber){
      payload.identityDocument={
        type: formValue.identityDocument.type,
        documentNumber: formValue.identityDocument.documentNumber,
        expirationDate: formValue.identityDocument.expirationDate
      }
    }

    console.log('Payload JSON:', payload);

    const formData = new FormData();
    formData.append('guestJson', JSON.stringify(payload));

    if (this.imageFile) {
      formData.append('documentImage', this.imageFile);
    }

    console.log('Form data:', formData);

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

  protected readonly FormGroup = FormGroup;
}
