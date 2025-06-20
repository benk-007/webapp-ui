import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ColComponent, RowComponent } from "@coreui/angular";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { DocumentImageGetModel } from "../../../../../models/document-image-get.model";
import { DocumentImageService } from "../../../sevices/document-image.service";

@Component({
  selector: 'app-document-gallery',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    TranslatePipe
  ],
  templateUrl: './document-gallery.component.html',
  styleUrl: './document-gallery.component.scss'
})
export class DocumentGalleryComponent implements OnInit, OnDestroy {

  @Input() documentId!: string;

  image?: DocumentImageGetModel;
  imageUrl?: SafeUrl;
  imageLoaded: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly imageService: DocumentImageService,
    private readonly sanitizer: DomSanitizer,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.retrieveImage();
  }

  retrieveImage() {
    this.subscriptions.push(
      this.imageService.getImagesByDocumentId(this.documentId).subscribe({
        next: (data) => {
          if (data.content.length > 0) {
            this.image = data.content[0];
            this.retrieveImageBlob(this.image.id);
          } else {
            this.imageLoaded = true;
          }
        },
        error: () => {
          this.imageLoaded = true;
        }
      })
    );
  }

  retrieveImageBlob(imageId: string) {
    this.subscriptions.push(
      this.imageService.getImageById(imageId).subscribe({
        next: (data: Blob) => {
          const objectUrl = URL.createObjectURL(data);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
          this.imageLoaded = true;
        },
        error: () => {
          this.imageLoaded = true;
        }
      })
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastr.error('Invalid file type.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    if (this.image) {
      // First delete existing image
      this.subscriptions.push(
        this.imageService.deleteById(this.image.id).subscribe({
          next: () => {
            console.log('Existing image deleted.');
            this.uploadNewImage(formData);
          },
          error: () => {
            this.toastr.error(
              this.translate.instant('documents.edit.notifications.image-upload.error.message'),
              this.translate.instant('documents.edit.notifications.image-upload.error.title')
            );
          }
        })
      );
    } else {
      this.uploadNewImage(formData);
    }
  }

  private uploadNewImage(formData: FormData): void {
    this.subscriptions.push(
      this.imageService.postImage(this.documentId, formData).subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('documents.edit.notifications.image-upload.success.message'),
            this.translate.instant('documents.edit.notifications.image-upload.success.title')
          );
          this.imageUrl = undefined;
          this.retrieveImage();
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('documents.edit.notifications.image-upload.error.message'),
            this.translate.instant('documents.edit.notifications.image-upload.error.title')
          );
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
