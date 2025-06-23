import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { DocumentTypeEnum } from '../../../../models/document-type.enum';
import { IdentityDocumentItemGetModel } from '../../../../models/identity-document-item-get.model';
import { IdentityDocumentService } from '../../../../services/identity-document.service';

import {
  NgSelectComponent, NgLabelTemplateDirective, NgOptionTemplateDirective
} from '@ng-select/ng-select';
import {
  RowComponent, ColComponent, FormDirective, FormControlDirective,
  FormLabelDirective, FormFeedbackComponent, ButtonDirective
} from '@coreui/angular';
import {DocumentGalleryComponent} from "./gallery/document-gallery.component";

@Component({
  selector: 'app-document-edit',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    NgSelectComponent,
    FormFeedbackComponent,
    ColComponent,
    RowComponent,
    RouterLink,
    ButtonDirective,
    FormDirective,
    FormLabelDirective,
    NgOptionTemplateDirective,
    NgLabelTemplateDirective,
    FormControlDirective,
    DocumentGalleryComponent
  ],
  templateUrl: './documents-edit.component.html',
  styleUrl: './documents-edit.component.scss'
})
export class DocumentsEditComponent implements OnInit {

  documentForm!: FormGroup;
  public documentId!: string;
  public guestId!: string;

  documentTypes = Object.values(DocumentTypeEnum);

  constructor(
    private readonly fb: FormBuilder,
    private readonly documentService: IdentityDocumentService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.guestId = this.route.parent?.parent?.snapshot.paramMap.get('id')!;
    this.documentId = this.route.snapshot.paramMap.get('documentId')!;

    this.documentForm = this.fb.group({
      type: [null, Validators.required],
      documentNumber: [null, Validators.required],
      expirationDate: [null, Validators.required]
    });

    this.loadDocument();
  }

  private loadDocument(): void {
    this.documentService.getDocumentById(this.documentId, this.guestId).subscribe({
      next: (data) => {
        this.documentForm.patchValue({
          type: data.type,
          documentNumber: data.documentNumber,
          expirationDate: data.expirationDate
        });
      },
      error: () => {
        this.toastr.error(this.translate.instant('documents.edit.load-error'));
      }
    });
  }

  submit(): void {
    if (this.documentForm.invalid) {
      this.toastr.warning(this.translate.instant('commons.form.validation-errors'));
      return;
    }

    const payload = this.documentForm.value;

    this.documentService.patchDocumentById(this.documentId, this.guestId, payload).subscribe({
      next: () => {
        this.toastr.info(
          this.translate.instant('documents.edit.notifications.info.message'),
          this.translate.instant('documents.edit.notifications.info.title')
        );
        this.router.navigate(['/guests', this.guestId, 'documents']);
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('documents.edit.notifications.error.message'),
          this.translate.instant('documents.edit.notifications.error.title')
        );
      }
    });
  }
}
