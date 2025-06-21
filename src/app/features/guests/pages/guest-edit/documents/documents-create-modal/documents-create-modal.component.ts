import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { DocumentTypeEnum } from '../../../../models/document-type.enum';
import { DocumentService } from '../../../../services/document.service';
import {
  RowComponent, ColComponent, FormControlDirective, FormDirective, FormFeedbackComponent,
  FormLabelDirective, ButtonDirective
} from '@coreui/angular';
import {
  NgSelectComponent, NgLabelTemplateDirective, NgOptionTemplateDirective
} from '@ng-select/ng-select';

@Component({
  selector: 'app-document-create-modal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    RowComponent,
    ColComponent,
    FormControlDirective,
    FormDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    ButtonDirective,
    NgSelectComponent,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective
  ],
  templateUrl: './documents-create-modal.component.html',
  styleUrl: './documents-create-modal.component.scss'
})
export class DocumentCreateModalComponent implements OnInit, OnDestroy {

  @Output() actionConfirmed = new EventEmitter<void>();

  documentForm!: FormGroup;
  documentTypes = Object.values(DocumentTypeEnum);
  guestId!: string;
  imageFile: File | null = null;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly documentService: DocumentService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.documentForm = this.fb.group({
      type: [null, Validators.required],
      documentNumber: [null, Validators.required],
      expirationDate: [null, Validators.required],
      documentImage: [null]
    });
  }

  init(guestId: string): void {
    this.guestId = guestId;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please select a valid image file.');
      return;
    }

    this.imageFile = file;
    this.documentForm.get('documentImage')?.setValue(file);
  }

  submit(): void {
    if (this.documentForm.invalid) {
      this.toastr.warning(this.translate.instant('commons.form.validation-errors'));
      return;
    }

    const formValue = this.documentForm.value;
    const documentPayload = {
      type: formValue.type,
      documentNumber: formValue.documentNumber,
      expirationDate: formValue.expirationDate
    };

    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(documentPayload)], { type: 'application/json' });
    formData.append('payload', jsonBlob);

    if (this.imageFile) {
      formData.append('file', this.imageFile);
    }

    // Debug
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.subscriptions.push(
      this.documentService.createDocument(this.guestId, formData).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('documents.create.notifications.success.message'),
            this.translate.instant('documents.create.notifications.success.title')
          );
          this.actionConfirmed.emit();
          this.close();
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('documents.create.notifications.error.message'),
            this.translate.instant('documents.create.notifications.error.title')
          );
        }
      })
    );
  }

  close(): void {
    this.bsModalRef.hide();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
