import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ColComponent, RowComponent} from "@coreui/angular";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ImageGetModel} from "../../../../models/image-get.model";
import {ImageApiService} from "../../../../services/image-api.service";
import {Subscription} from "rxjs";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {ToastrService} from "ngx-toastr";
import {BsModalService} from "ngx-bootstrap/modal";
import {ConfirmModalComponent} from "../../../../../../shared/components/confirm-modal/confirm-modal.component";

@Component({
  selector: 'app-gallery',
  imports: [
    RowComponent,
    ColComponent,
    TranslatePipe
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  standalone: true,
  providers: [BsModalService]
})
export class GalleryComponent implements OnInit, OnDestroy {

  @Input()
  unitId!: string;

  images: ImageGetModel[] = [];
  coverImage: ImageGetModel | null = null;

  imageUrl: SafeUrl | null = null;
  private subscriptions: Subscription[] = [];

  constructor(private imageApiService: ImageApiService,
              private sanitizer: DomSanitizer, private toastrService: ToastrService,
              private translateService: TranslateService,
              private modalService: BsModalService) {
  }

  ngOnInit(): void {
    this.retrieveImages();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('unitId', this.unitId);
      formData.append('file', file);
      this.subscriptions.push(this.imageApiService.postImage(formData).subscribe({
        next: data => {
          console.log('Image uploaded successfully for unit with id:', this.unitId, 'API response is:', data);
          const objectUrl = URL.createObjectURL(file);
          data.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
          if (data.cover) {
            this.coverImage = data;
          } else {
            this.images.push(data);
          }
          this.toastrService.success(this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.upload.success.message'), this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.upload.success.title'))
        },
        error: err => {
          console.error('An error occurred when uploading image for unit with id:', this.unitId, 'Error message is:', err);
          this.toastrService.error(this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.upload.error.message'), this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.upload.error.title'))
        }
      }));
    }
  }

  confirmImageDeletion(image: ImageGetModel) {
    let initialState = {
      title: this.translateService.instant('units.edit-unit.tabs.general-information.gallery.delete-modal.title'),
      message: this.translateService.instant('units.edit-unit.tabs.general-information.gallery.delete-modal.message')
    }
    let confirmModalRef = this.modalService.show(ConfirmModalComponent, {initialState});
    this.subscriptions.push((confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(
      () => {
        this.deleteImage(image);
      }
    ))
  }

  setAsCover(image: ImageGetModel) {
    this.subscriptions.push(this.imageApiService.patchById(image.id).subscribe({
      next: data => {
        console.log('Image with id:', image.id, 'set as cover successfully. Api response is:', data);
        if (this.coverImage != null) {
          this.images.push(this.coverImage as ImageGetModel);
        }
        this.coverImage = data;
        this.coverImage.imageUrl = image.imageUrl;
        this.images = this.images.filter(item => item.id != data.id);
        this.toastrService.info(this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.cover.success.message'), this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.cover.success.title'))
      },
      error: err => {
        console.log('An error occurred when setting image as cover. Error message is:', err);
        this.toastrService.error(this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.cover.error.message'), this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.cover.error.title'))
      }
    }))
  }

  private deleteImage(image: ImageGetModel) {
    this.subscriptions.push(this.imageApiService.deleteById(image.id).subscribe({
      next: () => {
        console.log('Image with id:', image.id, 'deleted successfully');
        if (!image.cover) {
          this.images = this.images.filter(item => item.id != image.id);
        } else {
          this.coverImage = null;
        }
        this.toastrService.info(this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.delete.success.message'), this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.delete.success.title'))
      },
      error: err => {
        console.log('An error occurred when deleting image with id:', image.id, 'Error message is:', err);
        this.toastrService.error(this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.delete.error.message'), this.translateService.instant('units.edit-unit.tabs.general-information.gallery.notifications.delete.error.title'))
      }
    }))
  }


  private retrieveImages() {
    this.subscriptions.push(this.imageApiService.getImagesByUnitId(this.unitId).subscribe({
      next: data => {
        console.log('Unit images retrieved for unit with Id:', this.unitId, 'API response is:', data);
        this.images = data.content;
        if (this.images.length != 0) {
          this.images.forEach(image => this.retrieveImageById(image));
        }
      },
      error: err => {
        console.log('An error occurred when retrieving images for unit with Id:', this.unitId, 'Error message is:', err);
      }
    }))
  }

  private retrieveImageById(image: ImageGetModel) {
    this.subscriptions.push(this.imageApiService.getImageById(image.id).subscribe({
      next: (data: Blob) => {
        console.log('Image retrieved with id:', image.id, 'API response is:', data);
        const objectUrl = URL.createObjectURL(data);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.images.forEach(item => {
          if (image.id === item.id) {
            const objectURL = URL.createObjectURL(data);
            item.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          }
        });
        if (image.cover) {
          this.coverImage = image;
          this.images = this.images.filter(item => item.id != this.coverImage?.id);
        }
      },
      error: err => {
        console.log('An error occurred when retrieving image with id:', image.id, 'Error message is:', err);
      }
    }))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}

