import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent,
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from "@ng-select/ng-select";

import { IncidentService } from '../../services/incident.service';
import { IncidentPostModel } from '../../models/incident-post.model';
import { SeverityEnum } from '../../enums/severity.enum';
import { StatusEnum } from '../../enums/status.enum';
import { AuthService } from '../../../../core/services/auth.service';
import { CategorySelectComponent } from '../../../../shared/components/category-select/category-select.component';
import { UserSelectComponent } from '../../../../shared/components/user-select/user-select.component';
import { UnitSelectComponent } from '../../../../shared/components/unit-select/unit-select.component';
import { CategoryModel } from '../../models/category.model';
import { UserItemGetModel } from '../../../settings/user-settings/models/user-item-get.model';
import { UnitItemGetModel } from '../../../units/models/unit-item-get.model';
import { UserService } from '../../../settings/user-settings/services/user.service';
import {AuditGetModel} from "../../../../shared/models/audit-get.model";

@Component({
  selector: 'app-incident-create-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    ButtonDirective,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    TranslatePipe,
    CommonModule,
    NgSelectComponent,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    CategorySelectComponent,
    UserSelectComponent,
    UnitSelectComponent
  ],
  templateUrl: './incident-create-modal.component.html',
  styleUrl: './incident-create-modal.component.scss'
})
export class IncidentCreateModalComponent implements OnInit, OnDestroy {

  currentUser: UserItemGetModel | null = null;


  incidentForm: FormGroup;
  @Output() actionConfirmed = new EventEmitter<void>();

  // Énumérations pour les dropdowns
  severityOptions = Object.values(SeverityEnum);
  statusOptions = Object.values(StatusEnum);

  // Fichier image
  imageFiles: File[] = [];

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly incidentService: IncidentService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.incidentForm = this.fb.group({
      name: [null, [Validators.required]],
      reporterId: [null, [Validators.required]],
      reviewerId: [null],
      rentalId: [null],
      severity: [SeverityEnum.MEDIUM],
      status: [StatusEnum.OPEN],
      categoryIds: [[], [Validators.required, this.arrayNotEmptyValidator]],
      tags: [null],
      description: [null]
    });
  }

  ngOnInit(): void {
    this.setDefaultReporter();
  }


  //Récupération utilisateur actuel
  private setDefaultReporter(): void {
    const currentUser = this.authService.getUser();
    if (currentUser().userId && currentUser().username) {
      // Créer un objet UserItemGetModel pour l'affichage
      const defaultUser: UserItemGetModel = {
        id: currentUser().userId,
        fullName: currentUser().username, // Utiliser username au lieu de fullName
        email: currentUser().email,
        mobile: '',
        enabled: true,
        activated: true,
        roles: [],
        audit: {} as any
      };

      this.incidentForm.patchValue({
        reporterId: defaultUser
      });
    }
  }

  // Validator personnalisé pour s'assurer que l'array n'est pas vide
  private arrayNotEmptyValidator(control: any) {
    return control.value && control.value.length > 0 ? null : { required: true };
  }

  onImageSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    if (files.length > 0) {
      // Valider que tous les fichiers sont des images
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        this.toastrService.error('Please select only valid image files.');
        return;
      }
      this.imageFiles = files;
    }
  }

  removeImage(index: number): void {
    this.imageFiles.splice(index, 1);
  }


  onCategoriesSelected(categories: CategoryModel[]): void {
    // Extraire les IDs des catégories sélectionnées
    const categoryIds = categories.map(cat => cat.id);
    this.incidentForm.patchValue({
      categoryIds: categoryIds
    });
  }

  onReporterSelected(user: UserItemGetModel | null): void {
    this.incidentForm.patchValue({
      reporterId: user
    });
  }

  onReviewerSelected(user: UserItemGetModel | null): void {
    this.incidentForm.patchValue({
      reviewerId: user?.id || null
    });
  }

  onRentalSelected(units: UnitItemGetModel[] | null): void {
    // app-unit-select retourne un array même en mode single
    const selectedUnit = units && units.length > 0 ? units[0] : null;
    this.incidentForm.patchValue({
      rentalId: selectedUnit
    });
  }

  submit(): void {
    if (!this.incidentForm.valid) {
      this.markFormGroupTouched();
      this.toastrService.error('Please fill in all required fields.');
      return;
    }

    const formValue = this.incidentForm.value;

    const payload: IncidentPostModel = {
      name: formValue.name,
      reporterId: formValue.reporterId,
      reviewerId: formValue.reviewerId,
      rentalId: formValue.rentalId,
      severity: formValue.severity,
      status: formValue.status,
      categoryIds: formValue.categoryIds,
      tags: formValue.tags,
      description: formValue.description
    };

    const formData = new FormData();
    const incidentJsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    formData.append('payload', incidentJsonBlob);

    // Ajouter toutes les images
    this.imageFiles.forEach((file, index) => {
      formData.append(`files`, file);
    });

    this.subscriptions.push(
      this.incidentService.postIncident(formData).subscribe({
        next: () => {
          this.actionConfirmed.emit();
          this.closeModal();
          const msg = this.translateService.instant('incidents.create.form.notifications.success.message');
          const title = this.translateService.instant('incidents.create.form.notifications.success.title');
          this.toastrService.success(msg, title);
        },
        error: (err) => {
          console.error('Error while creating incident:', err);
          const msg = this.translateService.instant('incidents.create.form.notifications.error.message');
          const title = this.translateService.instant('incidents.create.form.notifications.error.title');
          this.toastrService.error(msg, title);
        }
      })
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.incidentForm.controls).forEach(key => {
      const control = this.incidentForm.get(key);
      control?.markAsTouched();
    });
  }

  closeModal(): void {
    this.modalRef.hide();
    this.incidentForm.reset();
    this.imageFiles = []; // Reset array
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
