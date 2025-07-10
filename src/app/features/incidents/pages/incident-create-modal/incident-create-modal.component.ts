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
import { UserItemGetModel } from '../../../settings/user-settings/models/user-item-get.model';
import {UserRefModel} from "../../models/user-ref.model";
import {RentalRefModel} from "../../models/rental-ref.model";
import {CategoryModel} from "../../models/category.model";
import {AuditGetModel} from "../../../../shared/models/audit-get.model";
import {CategoryService} from "../../services/category.service";

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
    private readonly categoryService: CategoryService,
    private readonly authService: AuthService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.incidentForm = this.fb.group({
      name: [null, [Validators.required]],
      reporter: [null, [Validators.required]],
      reviewer: [null],
      rental: [null],
      severity: [SeverityEnum.MEDIUM],
      status: [StatusEnum.OPEN],
      categories: [[], [Validators.required, this.arrayNotEmptyValidator]],
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
    if (currentUser().userId) {
      // Créer directement un UserRefModel (seulement id + name)
      const defaultReporter: UserRefModel = {
        id: currentUser().userId,
        name: currentUser().username
      };

      this.incidentForm.patchValue({
        reporter: defaultReporter
      });
    }
  }

  // Validator personnalisé pour s'assurer que l'array n'est pas vide
  private arrayNotEmptyValidator(control: any) {
    return control.value && control.value.length > 0 ? null : { required: true };
  }

  onImageSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.toastrService.error('Please select valid image files only.');
        return;
      }
    }

    this.imageFiles = files;
  }

  private getCategoryById(categoryId: string): CategoryModel | undefined {

    return { id: categoryId, name: 'Category Name' };
  }

  submit(): void {
    if (!this.incidentForm.valid) {
      this.markFormGroupTouched();
      this.toastrService.error('Please fill in all required fields.');
      return;
    }

    const formValue = this.incidentForm.value;

    // Transformation des objets complets en références (id + name seulement)
    const reporterRef: UserRefModel = formValue.reporter;

    const reviewerRef: UserRefModel | undefined = formValue.reviewer;

    const rentalRef: RentalRefModel | undefined = formValue.rental;

    const categoriesRef: CategoryModel[] = formValue.categories || [];



    const payload: IncidentPostModel = {
      name: formValue.name,
      reporter: reporterRef,
      reviewer: reviewerRef,
      rental: rentalRef,
      severity: formValue.severity,
      status: formValue.status,
      categories: categoriesRef,
      tags: formValue.tags,
      description: formValue.description
    };

    console.log('Incident payload:', payload);

    const formData = new FormData();
    const incidentJsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    formData.append('payload', incidentJsonBlob);

    // Ajouter toutes les images
    this.imageFiles.forEach((file, index) => {
      formData.append(`files`, file);
    });

    // (for debugging)
    formData.forEach((value, key) => {
      console.log(key, value);
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
