import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslatePipe } from '@ngx-translate/core';
import { AuditNamePipe } from '../../pipes/audit-name.pipe';

@Component({
  selector: 'app-image-view-modal',
  standalone: true,
  imports: [
    DatePipe,
    TranslatePipe,
    AuditNamePipe
  ],
  templateUrl: './image-view-modal.component.html',
  styleUrl: './image-view-modal.component.scss'
})
export class ImageViewModalComponent {

  // Propriétés injectées par la modal
  imageUrl!: string;
  fileName!: string;
  fileSize!: string;
  createdAt!: Date;
  createdBy!: string;

  constructor(private readonly modalRef: BsModalRef) {}

  closeModal(): void {
    this.modalRef.hide();
  }
}
