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
import * as moment from 'moment-timezone';

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

  instructionsForm: FormGroup;
  private unitId!: string;
  private subscriptions: Subscription[] = [];
  isLoading = false;
  isSaving = false;

  // Propriétés pour les timepickers (SPINNERS CACHÉS)
  isMeridian = false; // Format 24h
  showSpinners = false; // Cacher les spinners

  // Liste des fuseaux horaires avec moment-timezone
  timeZones: TimeZone[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private unitApiService: UnitApiService,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {
    this.instructionsForm = this.createForm();
    this.initializeTimeZones();
    this.setupTimeZoneWatcher();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.activatedRoute.parent?.paramMap.subscribe(params => {
        this.unitId = params.get('unitId') as string;
        if (this.unitId) {
          this.loadInstructions();
        }
      }) || new Subscription()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Initialiser les fuseaux horaires avec moment-timezone
   */
  private initializeTimeZones(): void {
    this.timeZones = moment.tz.names()
      .map(tz => ({
        value: tz,
        label: `${tz.replace(/_/g, ' ')} (${moment.tz(tz).format('Z')})`
      }))
      .sort((a, b) => moment.tz(a.value).utcOffset() - moment.tz(b.value).utcOffset());
  }

  /**
   * Observer les changements de fuseau horaire
   */
  private setupTimeZoneWatcher(): void {
    this.instructionsForm.get('timeZone')?.valueChanges.subscribe(newTimeZone => {
      if (newTimeZone) {
        console.log(`Timezone changed to: ${newTimeZone}`);
        // Plus de conversion automatique - on garde les heures telles quelles
      }
    });
  }

  /**
   * Créer le formulaire réactif avec les validations
   */
  private createForm(): FormGroup {
    const defaultCheckInTime = new Date();
    defaultCheckInTime.setHours(15, 0, 0, 0); // 15:00

    const defaultCheckOutTime = new Date();
    defaultCheckOutTime.setHours(11, 0, 0, 0); // 11:00

    return this.formBuilder.group({
      checkInTime: [defaultCheckInTime, Validators.required],
      checkOutTime: [defaultCheckOutTime, Validators.required],
      timeZone: ['UTC', Validators.required],
      wifiName: [''],
      wifiPassword: [''],
      securityCode: [''],
      keyPickup: [''],
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
   * Remplir le formulaire avec les données reçues du backend
   */
  private populateForm(instructions: UnitInstructionsGetModel): void {
    const timeZone = instructions.checkTimes?.timeZone || 'UTC';

    // CHANGEMENT : On utilise directement les heures reçues sans conversion
    let checkInTime = new Date();
    let checkOutTime = new Date();

    if (instructions.checkTimes?.checkInTime) {
      // Parser l'heure directement sans conversion timezone
      const [hours, minutes] = instructions.checkTimes.checkInTime.split(':').map(Number);
      checkInTime.setHours(hours, minutes, 0, 0);
    } else {
      checkInTime.setHours(15, 0, 0, 0);
    }

    if (instructions.checkTimes?.checkOutTime) {
      // Parser l'heure directement sans conversion timezone
      const [hours, minutes] = instructions.checkTimes.checkOutTime.split(':').map(Number);
      checkOutTime.setHours(hours, minutes, 0, 0);
    } else {
      checkOutTime.setHours(11, 0, 0, 0);
    }

    this.instructionsForm.patchValue({
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      timeZone: timeZone,
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

    this.instructionsForm.markAsPristine();
    this.instructionsForm.updateValueAndValidity();
  }

  /**
   * Soumettre le formulaire (sauvegarde)
   */
  onSave(): void {
    if (this.instructionsForm.valid) {
      this.isSaving = true;
      const formValue = this.instructionsForm.value;

      // CHANGEMENT : On utilise formatTimeForApi au lieu de formatTimeForApiWithTimezone
      const checkInTimeString = this.formatTimeForApi(formValue.checkInTime);
      const checkOutTimeString = this.formatTimeForApi(formValue.checkOutTime);

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

      console.log('Payload to be sent (NO timezone conversion):', JSON.stringify(payload, null, 2));

      this.subscriptions.push(
        this.unitApiService.updateUnitInstructionsById(this.unitId, payload).subscribe({
          next: (response) => {
            this.isSaving = false;
            console.log('Instructions saved successfully:', response);

            this.toastrService.info(
              this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.success.message'),
              this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.success.title')
            );

            this.instructionsForm.markAsPristine();
          },
          error: (error) => {
            console.error('Error saving instructions:', error);
            this.isSaving = false;

            this.toastrService.error(
              this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.error.message'),
              this.translateService.instant('units.edit-unit.tabs.rental-instructions.notifications.error.title')
            );
          }
        })
      );
    } else {
      this.markFormGroupTouched(this.instructionsForm);
      this.toastrService.warning(
        'Please fill in all required fields correctly including check-in and check-out times.',
        'Form Validation'
      );
    }
  }

  /**
   * Convertir un objet Date en format HH:mm simple (AUCUNE conversion timezone)
   */
  private formatTimeForApi(date: Date): string {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }


  onCancel(): void {
    if (this.isFormDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.loadInstructions();
        this.toastrService.info('Changes have been discarded.', 'Cancel');
      }
    }
  }

  hasError(fieldName: string): boolean {
    const field = this.instructionsForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldValue(fieldName: string): any {
    return this.instructionsForm.get(fieldName)?.value;
  }

  get isFormDirty(): boolean {
    return this.instructionsForm.dirty;
  }

  get isFormValid(): boolean {
    return this.instructionsForm.valid;
  }

  /**
   * CHANGEMENT : Debug payload simplifié sans conversion timezone
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
