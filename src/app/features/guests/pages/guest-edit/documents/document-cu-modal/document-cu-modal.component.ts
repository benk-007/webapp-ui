import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from "rxjs";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {IdentityDocumentService} from "../../../../services/identity-document.service";
import {BsModalRef} from "ngx-bootstrap/modal";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";
import {IdentityDocumentItemGetModel} from "../../../../models/identity-document-item-get.model";
import {
  ButtonDirective,
  ColComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  FormControlDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  InputGroupComponent,
  RowComponent
} from "@coreui/angular";
import {JsonPipe, NgForOf} from "@angular/common";
import {DocumentTypeEnum} from "../../../../models/document-type.enum";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-document-cu-modal',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    ButtonDirective,
    ColComponent,
    RowComponent,
    FormLabelDirective,
    InputGroupComponent,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    FormControlDirective,
    FormFeedbackComponent,
    NgForOf,
    JsonPipe
  ],
  templateUrl: './document-cu-modal.component.html',
  styleUrl: './document-cu-modal.component.scss'
})
export class DocumentCuModalComponent implements OnInit, OnDestroy {
  imageUrl: SafeUrl | null = null;
  file: any;
  documentForm: FormGroup;
  documentTypes: DocumentTypeEnum[] = Object.values(DocumentTypeEnum);
  documentToEdit!: IdentityDocumentItemGetModel | undefined;
  guestId!: string;
  @Output() actionConfirmed = new EventEmitter<void>();
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly fb: FormBuilder,
              private readonly documentService: IdentityDocumentService,
              private readonly sanitizer: DomSanitizer,
              private readonly modalRef: BsModalRef,
              private readonly translateService: TranslateService,
              private readonly toastrService: ToastrService) {
    this.documentForm = this.fb.group({
      type: [DocumentTypeEnum.IDENTITY_CARD, [Validators.required]],
      value: [null, [Validators.required]],
      expirationDate: [null, [Validators.required]],
      file: [null, [Validators.required]]
    })
  }

  ngOnInit(): void {
    console.log('your document to edit', this.documentToEdit, this.guestId);
    this.documentForm.patchValue(this.documentToEdit as IdentityDocumentItemGetModel);
    if (this.documentToEdit?.fileProvided) {
      this.retrieveIdentityDocumentFile();
    }
  }

  private retrieveIdentityDocumentFile() {
    this.subscriptions.push(this.documentService.getIdentityDocumentImageById(this.documentToEdit?.id as string).subscribe({
      next: (res) => {
        console.info('Identity Document Image retrieved by Id:', this.documentToEdit?.id, 'API response is:', res);
        const objectUrl = URL.createObjectURL(res);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.documentForm.patchValue({file: this.imageUrl})
      },
      error: (err) => {
        console.error('An error occurred when retrieving identity document file. API error response is:', err);
      }
    }))
  }


  submit() {
    if (this.documentToEdit) {
      //updating existing document

    } else {
      //create a new document
      let payload = {
        type: this.documentForm.value.type,
        value: this.documentForm.value.value,
        expirationDate: this.documentForm.value.expirationDate,
        guestId: this.guestId
      }
      const formData = new FormData();
      formData.append('payload', new Blob([JSON.stringify(payload)], {type: 'application/json'}));
      formData.append('file', this.file);
      this.subscriptions.push(this.documentService.createDocument(formData).subscribe({
        next: (res) => {
          console.info('Document created successfully. API response is:', res);
          this.toastrService.success(this.translateService.instant('documents.cu-modal.notifications.success.message.create'), this.translateService.instant('documents.cu-modal.notifications.success.title.create'));
          this.closeModal();
          this.actionConfirmed.emit();
        },
        error: (err) => {
          console.error('An error occurred during identity document creation. API response error:', err);
          this.toastrService.success(this.translateService.instant('documents.cu-modal.notifications.error.message.create'), this.translateService.instant('documents.cu-modal.notifications.error.title.create'));
          this.closeModal();
        }
      }))
    }
  }

  closeModal() {
    this.modalRef.hide();
  }

  setDocumentType(documentType: DocumentTypeEnum) {
    this.documentForm.patchValue({
      type: documentType
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const objectUrl = URL.createObjectURL(file);
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      this.file = file;
      this.documentForm.patchValue({
        file: file
      })
    }
  }

  removeImage() {

  }

  ngOnDestroy(): void {
    console.debug("[Document CU Modal] Unsubscribing all subscriptions ...")
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


}
