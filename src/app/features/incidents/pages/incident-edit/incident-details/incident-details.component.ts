import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from '@coreui/angular';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';

// Services
import { IncidentService } from '../../../services/incident.service';

// Models
import { IncidentGetModel } from '../../../models/incident-get.model';
import { IncidentPatchModel } from '../../../models/incident-patch.model';
import { SeverityEnum } from '../../../enums/severity.enum';
import { StatusEnum } from '../../../enums/status.enum';

// Shared components
import { UserSelectComponent } from '../../../../../shared/components/user-select/user-select.component';
import { UnitSelectComponent } from '../../../../../shared/components/unit-select/unit-select.component';
import { CategorySelectComponent } from '../../../../../shared/components/category-select/category-select.component';

// Incident-specific components
import { IncidentGalleryComponent } from './incident-gallery/incident-gallery.component';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [
    // Angular
    ReactiveFormsModule,

    // CoreUI
    RowComponent,
    ColComponent,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    ButtonDirective,

    // NgSelect
    NgSelectComponent,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,

    // Translation
    TranslatePipe,

    // Shared components
    UserSelectComponent,
    UnitSelectComponent,
    CategorySelectComponent,

    // Incident components
    IncidentGalleryComponent
  ],
  templateUrl: './incident-details.component.html',
  styleUrl: './incident-details.component.scss'
})
export class IncidentDetailsComponent implements OnInit, OnDestroy {


  // Formulaire d'édition
  incidentForm: FormGroup;

  // ID de l'incident (récupéré depuis l'URL)
  incidentId!: string;

  // Données de l'incident
  incident!: IncidentGetModel;

  // Options pour les dropdowns
  severityOptions = Object.values(SeverityEnum);
  statusOptions = Object.values(StatusEnum);

  // Gestion des subscriptions
  private subscriptions: Subscription[] = [];


  constructor(
    private readonly fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly incidentService: IncidentService,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    // Initialisation du formulaire
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
    // Récupération de l'ID depuis l'URL et chargement des données
    this.subscriptions.push(
      combineLatest([
        this.activatedRoute.parent!.paramMap
      ]).subscribe(([parentParams]) => {
        this.incidentId = parentParams.get('id') as string;
        this.retrieveIncident();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


  /**
   * Soumission du formulaire de mise à jour
   */
  submit(): void {
    if (!this.incidentForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.incidentForm.value;

    const payload: IncidentPatchModel = {
      name: formValue.name,
      reporter: formValue.reporter,
      reviewer: formValue.reviewer,
      rental: formValue.rental,
      severity: formValue.severity,
      status: formValue.status,
      categories: (formValue.categories || []).map((cat: any) =>
        typeof cat === 'string'
          ? this.incident.categories.find(c => c.id === cat)
          : { id: cat.id, name: cat.name }
      ),
      tags: formValue.tags,
      description: formValue.description
    };

    this.subscriptions.push(
      this.incidentService.updateIncidentById(this.incidentId, payload).subscribe({
        next: (updatedIncident) => {
          console.log('Incident updated successfully:', updatedIncident);
          this.incident = updatedIncident;
          this.toastrService.info(
            this.translateService.instant('incidents.edit.notifications.update.success.message', { name: updatedIncident.name }),
            this.translateService.instant('incidents.edit.notifications.update.success.title')
          );
        },
        error: (err) => {
          console.error('Error updating incident:', err);
          this.toastrService.error(
            this.translateService.instant('incidents.edit.notifications.update.error.message'),
            this.translateService.instant('incidents.edit.notifications.update.error.title')
          );
        }
      })
    );
  }


  /**
   * Récupère l'incident depuis l'API
   */
  private retrieveIncident(): void {
    this.subscriptions.push(
      this.incidentService.getIncidentById(this.incidentId).subscribe({
        next: (data) => {
          console.log('Incident details retrieved:', data);
          this.incident = data;
          this.populateForm(data);
        },
        error: (err) => {
          console.error('Error retrieving incident details:', err);
        }
      })
    );
  }

  /**
   * Remplit le formulaire avec les données de l'incident
   */
  /**
   * Remplit le formulaire avec les données de l'incident
   */
  private populateForm(incident: IncidentGetModel): void {
    console.log('=== POPULATE FORM DEBUG ===');
    console.log('Raw incident rental:', incident.rental);
    console.log('Raw incident categories:', incident.categories);

    // Transformer rental en format attendu par UnitSelectComponent
    const rentalValue = incident.rental ? {
      id: incident.rental.id,
      name: incident.rental.name
    } : null;

    // Transformer categories en tableau d'IDs pour CategorySelectComponent
    const categoriesValue = incident.categories ?
      incident.categories.map(cat => cat.id) : [];

    console.log('Transformed rental value:', rentalValue);
    console.log('Transformed categories value:', categoriesValue);

    this.incidentForm.patchValue({
      name: incident.name,
      reporter: incident.reporter,
      reviewer: incident.reviewer,
      rental: rentalValue,
      severity: incident.severity,
      status: incident.status,
      categories: categoriesValue, // Maintenant définie correctement
      tags: incident.tags,
      description: incident.description
    });

    console.log('Final form value after patchValue:', this.incidentForm.value);
    console.log('Rental control value:', this.incidentForm.get('rental')?.value);
    console.log('Categories control value:', this.incidentForm.get('categories')?.value);
  }

  /**
   * Marque tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.incidentForm.controls).forEach(key => {
      const control = this.incidentForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Validateur personnalisé pour s'assurer que l'array de catégories n'est pas vide
   */
  private arrayNotEmptyValidator(control: any) {
    return control.value && control.value.length > 0 ? null : { required: true };
  }
}
