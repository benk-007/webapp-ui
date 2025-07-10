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
  imageFile: File | null = null;

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
    const authUser = this.authService.getUser();
    if (authUser().userId) {
      // Récupérer l'objet utilisateur complet depuis la liste
      this.loadCurrentUserFromUserService(authUser().userId);
    }
  }

  private loadCurrentUserFromUserService(userId: string): void {
    // Utiliser UserService pour récupérer l'objet utilisateur complet
    this.subscriptions.push(
      this.userService.getUsersByPage(0, 1000, 'fullName', 'asc', '').subscribe({
        next: (res) => {
          const foundUser = res.content.find(user => user.id === userId);
          if (foundUser) {
            this.currentUser = foundUser;
            // Définir l'utilisateur complet dans le formulaire
            this.incidentForm.patchValue({
              reporterId: foundUser
            });
          }
        },
        error: (err) => console.error('Failed to load current user:', err)
      })
    );
  }

  // Validator personnalisé pour s'assurer que l'array n'est pas vide
  private arrayNotEmptyValidator(control: any) {
    return control.value && control.value.length > 0 ? null : { required: true };
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastrService.error('Please select a valid image file.');
        return;
      }
      this.imageFile = file;
    }
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
    // app-unit-select retourne un array, on prend le premier élément
    const selectedUnit = units && units.length > 0 ? units[0] : null;
    this.incidentForm.patchValue({
      rentalId: selectedUnit?.id || null
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

    if (this.imageFile) {
      formData.append('file', this.imageFile);
    }

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
    this.imageFile = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
