import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent
} from '@coreui/angular';

// Services
import { IncidentImageService } from '../../../../services/incident-image.service';

// Models
import { IncidentImageGetModel } from '../../../../models/incident-image-get.model';

// Shared components
import { ConfirmModalComponent } from '../../../../../../shared/components/confirm-modal/confirm-modal.component';
import { AuditNamePipe } from '../../../../../../shared/pipes/audit-name.pipe';
import {ImageViewModalComponent} from "../../../../../../shared/components/image-view-modal/image-view-modal.component";

@Component({
  selector: 'app-incident-gallery',
  standalone: true,
  imports: [
    // Angular common
    DatePipe,

    // CoreUI
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,

    // Translation & pipes
    TranslatePipe,
    AuditNamePipe,

    // Bootstrap
    TooltipDirective
  ],
  templateUrl: './incident-gallery.component.html',
  styleUrl: './incident-gallery.component.scss',
  providers: [BsModalService]
})
export class IncidentGalleryComponent implements OnInit, OnDestroy {

  // ========== INPUTS ==========

  @Input() incidentId!: string;

  // ========== PROPRIÉTÉS ==========

  // Liste des images
  images: IncidentImageGetModel[] = [];

  // Gestion des subscriptions
  private subscriptions: Subscription[] = [];

  // ========== CONSTRUCTEUR ==========

  constructor(
    private readonly incidentImageService: IncidentImageService,
    private readonly sanitizer: DomSanitizer,
    private readonly toastrService: ToastrService,
    private readonly translateService: TranslateService,
    private readonly modalService: BsModalService
  ) {}

  // ========== LIFECYCLE HOOKS ==========

  ngOnInit(): void {
    this.retrieveImages();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // ========== MÉTHODES PUBLIQUES ==========

  /**
   * Gère la sélection de fichiers pour l'upload
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Upload tous les fichiers en une seule fois avec formData
      const formData = new FormData();
      formData.append('incidentId', this.incidentId);

      // Ajouter tous les fichiers avec la clé 'files'
      Array.from(input.files).forEach(file => {
        formData.append('files', file);
      });

      this.uploadImages(formData);
      input.value = '';
    }
  }

  /**
   * Ouvre une image en mode visualisation dans une modal
   */
  viewImage(image: IncidentImageGetModel): void {
    this.subscriptions.push(
      this.incidentImageService.getImageById(image.id).subscribe({
        next: (blob) => {
          const imageUrl = URL.createObjectURL(blob);

          // Ouvrir la modal de visualisation
          const initialState = {
            imageUrl: imageUrl,
            fileName: image.fileName,
            fileSize: this.formatFileSize(image.fileSize),
            createdAt: image.audit.createdAt,
            createdBy: image.audit.createdBy
          };

          const modalRef = this.modalService.show(ImageViewModalComponent, {
            initialState,
            class: 'modal-lg modal-dialog-centered',
            keyboard: true,
            backdrop: true
          });

          // Nettoyer l'URL quand la modal se ferme
          modalRef.onHidden?.subscribe(() => {
            URL.revokeObjectURL(imageUrl);
          });
        },
        error: (err) => {
          console.error('Error viewing image:', err);
          this.toastrService.error(
            this.translateService.instant('incidents.edit.gallery.notifications.view.error.message'),
            this.translateService.instant('incidents.edit.gallery.notifications.view.error.title')
          );
        }
      })
    );
  }

  /**
   * Télécharge une image
   */
  downloadImage(image: IncidentImageGetModel): void {
    this.subscriptions.push(
      this.incidentImageService.getImageById(image.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = image.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error downloading image:', err);
          this.toastrService.error(
            this.translateService.instant('incidents.edit.gallery.notifications.download.error.message'),
            this.translateService.instant('incidents.edit.gallery.notifications.download.error.title')
          );
        }
      })
    );
  }

  /**
   * Confirme la suppression d'une image
   */
  confirmImageDeletion(image: IncidentImageGetModel): void {
    const initialState = {
      title: this.translateService.instant('incidents.edit.gallery.delete-modal.title'),
      message: this.translateService.instant('incidents.edit.gallery.delete-modal.message')
    };

    const confirmModalRef = this.modalService.show(ConfirmModalComponent, { initialState });
    this.subscriptions.push(
      (confirmModalRef.content as ConfirmModalComponent).actionConfirmed.subscribe(() => {
        this.deleteImage(image);
      })
    );
  }

  /**
   * Formate la taille du fichier
   */
  formatFileSize(bytes?: number): string {
    if (!bytes) return 'N/A';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // ========== MÉTHODES PRIVÉES ==========

  /**
   * Récupère la liste des images depuis l'API
   */
  private retrieveImages(): void {
    this.subscriptions.push(
      this.incidentImageService.getImagesByIncidentId(this.incidentId).subscribe({
        next: (data) => {
          console.log('Incident images retrieved:', data);
          this.images = data.content;

          // Charger chaque image pour l'affichage
          this.images.forEach(image => this.loadImageData(image));
        },
        error: (err) => {
          console.error('Error retrieving incident images:', err);
        }
      })
    );
  }

  /**
   * Charge les données binaires d'une image
   */
  private loadImageData(image: IncidentImageGetModel): void {
    this.subscriptions.push(
      this.incidentImageService.getImageById(image.id).subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          image.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        },
        error: (err) => {
          console.error(`Error loading image ${image.id}:`, err);
        }
      })
    );
  }

  /**
   * Upload une image vers l'API
   */
  private uploadImages(formData: FormData): void {
    this.subscriptions.push(
      this.incidentImageService.postImage(formData).subscribe({
        next: (response) => {
          console.log('Images uploaded successfully:', response);
          // Rafraîchir la liste des images
          this.retrieveImages();

          this.toastrService.success(
            this.translateService.instant('incidents.edit.gallery.notifications.upload.success.message'),
            this.translateService.instant('incidents.edit.gallery.notifications.upload.success.title')
          );
        },
        error: (err) => {
          console.error('Error uploading images:', err);
          this.toastrService.error(
            this.translateService.instant('incidents.edit.gallery.notifications.upload.error.message'),
            this.translateService.instant('incidents.edit.gallery.notifications.upload.error.title')
          );
        }
      })
    );
  }

  /**
   * Supprime une image
   */
  private deleteImage(image: IncidentImageGetModel): void {
    this.subscriptions.push(
      this.incidentImageService.deleteById(image.id).subscribe({
        next: () => {
          console.log('Image deleted successfully:', image.id);

          // Retirer l'image de la liste
          this.images = this.images.filter(img => img.id !== image.id);

          this.toastrService.success(
            this.translateService.instant('incidents.edit.gallery.notifications.delete.success.message'),
            this.translateService.instant('incidents.edit.gallery.notifications.delete.success.title')
          );
        },
        error: (err) => {
          console.error('Error deleting image:', err);
          this.toastrService.error(
            this.translateService.instant('incidents.edit.gallery.notifications.delete.error.message'),
            this.translateService.instant('incidents.edit.gallery.notifications.delete.error.title')
          );
        }
      })
    );
  }
}
