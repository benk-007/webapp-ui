import { Component } from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  InputGroupComponent, InputGroupTextDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import {
  cilClock,
  cilPen,
  cilSearch,
  cilSortAscending,
  cilSortDescending,
  cilSwapVertical,
  cilTrash
} from '@coreui/icons';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { ToastrService } from 'ngx-toastr';
import { EmptyDataComponent } from '../../../../../../shared/components/empty-data/empty-data.component';
import { ListContentComponent } from '../../../../../../shared/components/list-content/list-content.component';
import { DocumentItemGetModel } from '../../../../models/document-item-get.model';

import { DatePipe } from '@angular/common';
import {DocumentService} from "../../sevices/document.service";
import {TableControlComponent} from "../../../../../../shared/components/table-control/table-control.component";
import {AuditNamePipe} from "../../../../../../shared/pipes/audit-name.pipe";
import {BadgeComponent} from "../../../../../../shared/components/badge/badge.component";
import {DocumentImageService} from "../../sevices/document-image.service";
import {DocumentCreateModalComponent} from "../documents-create-modal/documents-create-modal.component";


@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    ButtonDirective,
    RowComponent,
    TranslatePipe,
    IconDirective,
    SpinnerComponent,
    TableDirective,
    EmptyDataComponent,
    DatePipe,
    InputGroupComponent,
    ColComponent,
    TableControlComponent,
    InputGroupTextDirective,
    FormControlDirective,
    AuditNamePipe,
    BadgeComponent,
    RouterLink
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
  providers: [BsModalService]
})
export class DocumentsComponent extends ListContentComponent {
  icons = {
    cilSearch,
    cilClock,
    cilPen,
    cilSwapVertical,
    cilSortAscending,
    cilSortDescending,
    cilTrash
  };
  guestId!: string;

  override listContent: DocumentItemGetModel[] = [];

  constructor(
      public override router: Router,
      public override route: ActivatedRoute,
      public readonly documentService: DocumentService,
      private readonly toastr: ToastrService,
      private readonly DocumentImageService: DocumentImageService,
      private readonly modalService: BsModalService
  ) {
    super(router, route);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.size = 10;
    this.subscribeToQueryParam();


    this.subscriptions.push(
        this.route.parent!.paramMap.subscribe(paramMap => {
          const id = paramMap.get('id');
          if (id) {
            this.guestId = id;
            this.refreshListContent();
          }
        })
    );
  }

  override retrieveListContent(params: any) {
    super.retrieveListContent(params);
    this.subscriptions.push(
        this.documentService.getDocumentsByGuestId(this.guestId, this.page, this.size).subscribe({
          next: (data) => {
            super.handleSuccessData(data);

            this.listContent.forEach((doc) => {
              this.DocumentImageService.getImagesByDocumentId(doc.id).subscribe({
                next: (imageData) => {
                  doc.hasImage = imageData.totalElements > 0;
                },
                error: () => {
                  doc.hasImage = false;
                }
              });
            });

          },
          error: (err) => {
            console.warn('Error retrieving documents:', err);
            if (!this.firstCallDone) this.firstCallDone = true;
          }
        })
    );
  }



  deleteDocument(document: DocumentItemGetModel): void {
    if (confirm(`Are you sure you want to delete document ${document.documentNumber}?`)) {
      this.documentService.deleteDocumentById(document.id, this.guestId).subscribe({
        next: () => {
          this.refreshListContent();
          this.toastr.success('Document deleted successfully.');
        },
        error: () => {
          this.toastr.error('An error occurred while deleting the document.');
        }
      });
    }
  }

  openDocumentCreateModal(): void {
    const initialState = { class: 'modal-lg' };
    const modalRef = this.modalService.show(DocumentCreateModalComponent, initialState);
    (modalRef.content as DocumentCreateModalComponent).init(this.guestId);
    this.subscriptions.push(
      (modalRef.content as DocumentCreateModalComponent).actionConfirmed.subscribe(() => {
        this.refreshListContent();
      })
    );
  }

}
