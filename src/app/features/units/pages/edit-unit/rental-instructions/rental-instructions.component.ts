import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UnitApiService } from '../../../services/unit-api.service';
import { UnitInstructionsGetModel } from '../../../models/unit-instructions-get.model';
import { UnitInstructionsPatchModel } from '../../../models/unit-instructions-patch.model';
import { CommonModule } from '@angular/common';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

// CoreUI Imports
import {
  ButtonDirective,
  ColComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent,
  SpinnerComponent
} from '@coreui/angular';

interface TimeZone {
  value: string;
  label: string;
}

@Component({
  selector: 'app-rental-instructions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    TimepickerModule,
    // CoreUI Components
    RowComponent,
    ColComponent,
    FormDirective,
    FormControlDirective,
    FormLabelDirective,
    FormFeedbackComponent,
    ButtonDirective,
    SpinnerComponent
  ],
  templateUrl: './rental-instructions.component.html',
  styleUrl: './rental-instructions.component.scss'
})
export class RentalInstructionsComponent implements OnInit, OnDestroy {

  instructionsForm: FormGroup; //Le formulaire réactif principal
  private unitId!: string; //Identifiant unique de l'unité de location
  private subscriptions: Subscription[] = []; //Gestion des abonnements RxJS
  isLoading = false; //État de chargement des données
  isSaving = false; //État de sauvegarde

  // Propriétés pour les timepickers
  isMeridian = false; // Format 24h
  showSpinners = true; // Afficher les spinners

  // Liste des fuseaux horaires
  timeZones: TimeZone[] = [
    { value: 'Africa/Casablanca', label: 'Africa/Casablanca (GMT+1)' },
    { value: 'Europe/London', label: 'Europe/London (GMT+0/GMT+1)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1/GMT+2)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (GMT+1/GMT+2)' },
    { value: 'Europe/Rome', label: 'Europe/Rome (GMT+1/GMT+2)' },
    { value: 'Europe/Madrid', label: 'Europe/Madrid (GMT+1/GMT+2)' },
    { value: 'America/New_York', label: 'America/New_York (GMT-5/GMT-4)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8/GMT-7)' },
    { value: 'America/Chicago', label: 'America/Chicago (GMT-6/GMT-5)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (GMT+8)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10/GMT+11)' },
    { value: 'UTC', label: 'UTC (GMT+0)' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private unitApiService: UnitApiService,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {
    this.instructionsForm = this.createForm();
  }

  //Cycle de vie et initialisation
  ngOnInit(): void {
    // Récupérer l'unitId depuis la route parent
    this.subscriptions.push(
      this.activatedRoute.parent?.paramMap.subscribe(params => {
        this.unitId = params.get('unitId') as string;
        if (this.unitId) {
          this.loadInstructions(); // Chargement des données
        }
      }) || new Subscription()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Créer le formulaire réactif avec les validations
   */
  private createForm(): FormGroup {
    // Créer des dates par défaut
    const defaultCheckInTime = new Date();
    defaultCheckInTime.setHours(15, 0, 0, 0); // 15:00

    const defaultCheckOutTime = new Date();
    defaultCheckOutTime.setHours(11, 0, 0, 0); // 11:00

    return this.formBuilder.group({
      // Champs pour les heures avec validation
      checkInTime: [defaultCheckInTime, Validators.required],
      checkOutTime: [defaultCheckOutTime, Validators.required],
      timeZone: ['UTC', Validators.required], // Valeur par défaut

      // Codes & Passwords (optionnels)
      wifiName: [''],
      wifiPassword: [''],
      securityCode: [''],
      keyPickup: [''], //Instructions récupération clés

      // Instructions (optionnels pour cette étape)
      checkInInstructions: [''],
      checkOutInstructions: [''],
      directions: [''],
      houseRules: [''],
      specialInstructions: [''],
      paymentTerms: [''],
      paymentInstructions: ['']
    });
  }

  /**
   * Charger les instructions depuis l'API
   */
  private loadInstructions(): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.unitApiService.getUnitInstructionsById(this.unitId).subscribe({
        next: (instructions: UnitInstructionsGetModel) => {
          if (!instructions) {
            console.warn('No instructions found. Using defaults.');
            this.isLoading = false;
            return;
          }

          this.populateForm(instructions);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading instructions:', error);
          this.isLoading = false;

          this.toastrService.error(
            this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.load-error.message'),
            this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.load-error.title')
          );
        }
      })
    );
  }

  /**
   * Remplir le formulaire avec les données reçues
   */
  private populateForm(instructions: UnitInstructionsGetModel): void {
    // Convertir les heures string en objets Date
    let checkInTime = new Date();
    let checkOutTime = new Date();

    if (instructions.checkTimes?.checkInTime) {
      const [hours, minutes] = instructions.checkTimes.checkInTime.split(':');
      checkInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      checkInTime.setHours(15, 0, 0, 0); // 15:00 par défaut
    }

    if (instructions.checkTimes?.checkOutTime) {
      const [hours, minutes] = instructions.checkTimes.checkOutTime.split(':');
      checkOutTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      checkOutTime.setHours(11, 0, 0, 0); // 11:00 par défaut
    }

    // Remplir le formulaire avec TOUS les champs, y compris les heures
    this.instructionsForm.patchValue({
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      timeZone: instructions.checkTimes?.timeZone || 'UTC',
      wifiName: instructions.accessCodes?.wifiName || '',
      wifiPassword: instructions.accessCodes?.wifiPassword || '',
      securityCode: instructions.accessCodes?.securityCode || '',
      keyPickup: instructions.accessCodes?.keyPickup || '',
      checkInInstructions: instructions.instructions?.checkInInstructions || '',
      checkOutInstructions: instructions.instructions?.checkOutInstructions || '',
      directions: instructions.instructions?.directions || '',
      houseRules: instructions.instructions?.houseRules || '',
      specialInstructions: instructions.instructions?.specialInstructions || '',
      paymentTerms: instructions.payment?.paymentTerms || '',
      paymentInstructions: instructions.payment?.paymentInstructions || ''
    });
  }

  /**
   * Soumettre le formulaire (sauvegarde)
   */
  onSave(): void {
    if (this.instructionsForm.valid) {
      this.isSaving = true;
      const formValue = this.instructionsForm.value;

      // Convertir les objets Date en format HH:mm pour l'API
      const checkInTimeString = this.formatTimeForApi(formValue.checkInTime);
      const checkOutTimeString = this.formatTimeForApi(formValue.checkOutTime);

      // Nouvelle structure pour l'API
      const payload: UnitInstructionsPatchModel = {
        checkTimes: {
          checkInTime: checkInTimeString,
          checkOutTime: checkOutTimeString,
          timeZone: formValue.timeZone
        },
        accessCodes: {
          wifiName: formValue.wifiName,
          wifiPassword: formValue.wifiPassword,
          securityCode: formValue.securityCode,
          keyPickup: formValue.keyPickup
        },
        instructions: {
          checkInInstructions: formValue.checkInInstructions,
          checkOutInstructions: formValue.checkOutInstructions,
          directions: formValue.directions,
          houseRules: formValue.houseRules,
          specialInstructions: formValue.specialInstructions
        },
        payment: {
          paymentTerms: formValue.paymentTerms,
          paymentInstructions: formValue.paymentInstructions
        }
      };

      // Affichage du JSON pour debug
      console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

      this.subscriptions.push(
        this.unitApiService.updateUnitInstructionsById(this.unitId, payload).subscribe({
          next: (response) => {
            this.isSaving = false;
            console.log('Instructions saved successfully:', response);

            // Toast de succès
            this.toastrService.success(
              this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.success.message'),
              this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.success.title'),
              {
                timeOut: 5000,
                closeButton: true,
                progressBar: true,
                positionClass: 'toast-top-right'
              }
            );

            // Marquer le formulaire comme non modifié après la sauvegarde
            this.instructionsForm.markAsPristine();
          },
          error: (error) => {
            console.error('Error saving instructions:', error);
            this.isSaving = false;

            // Toast d'erreur
            this.toastrService.error(
              this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.error.message'),
              this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.error.title'),
              {
                timeOut: 8000,
                closeButton: true,
                progressBar: true,
                positionClass: 'toast-top-right'
              }
            );
          }
        })
      );
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.instructionsForm);

      // Toast d'avertissement pour validation
      this.toastrService.warning(
        'Please fill in all required fields correctly including check-in and check-out times.',
        'Form Validation',
        {
          timeOut: 5000,
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right'
        }
      );
    }
  }

  /**
   * Annuler les modifications (reset du formulaire)
   */
  onCancel(): void {
    if (this.isFormDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.loadInstructions(); // Recharger les données originales

        this.toastrService.info(
          'Changes have been discarded.',
          'Cancel',
          {
            timeOut: 3000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right'
          }
        );
      }
    }
  }

  /**
   * Vérifier si un champ a des erreurs et est touché
   */
  hasError(fieldName: string): boolean {
    const field = this.instructionsForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Marquer tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Obtenir la valeur d'un champ spécifique
   */
  getFieldValue(fieldName: string): any {
    return this.instructionsForm.get(fieldName)?.value;
  }

  /**
   * Vérifier si le formulaire est sale (modifié)
   */
  get isFormDirty(): boolean {
    return this.instructionsForm.dirty;
  }

  /**
   * Vérifier si le formulaire est valide
   */
  get isFormValid(): boolean {
    return this.instructionsForm.valid;
  }

  /**
   * Convertir un objet Date en format HH:mm pour l'API
   */
  private formatTimeForApi(date: Date): string {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Getter pour le debug payload
   */
  get debugPayload(): any {
    const formValue = this.instructionsForm.value;
    return {
      checkTimes: {
        checkInTime: this.formatTimeForApi(formValue.checkInTime),
        checkOutTime: this.formatTimeForApi(formValue.checkOutTime),
        timeZone: formValue.timeZone
      },
      accessCodes: {
        wifiName: formValue.wifiName,
        wifiPassword: formValue.wifiPassword,
        securityCode: formValue.securityCode,
        keyPickup: formValue.keyPickup
      },
      instructions: {
        checkInInstructions: formValue.checkInInstructions,
        checkOutInstructions: formValue.checkOutInstructions,
        directions: formValue.directions,
        houseRules: formValue.houseRules,
        specialInstructions: formValue.specialInstructions
      },
      payment: {
        paymentTerms: formValue.paymentTerms,
        paymentInstructions: formValue.paymentInstructions
      }
    };
  }
}
