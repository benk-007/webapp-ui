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
    const commonTimezones = [
      'Africa/Casablanca',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Dubai',
      'Australia/Sydney',
      'UTC'
    ];

    this.timeZones = commonTimezones.map(tz => ({
      value: tz,
      label: `${tz.replace('_', ' ')} (${moment.tz(tz).format('Z')})`
    }));
  }

  /**
   * Observer les changements de fuseau horaire pour recalculer les heures
   */
  private setupTimeZoneWatcher(): void {
    this.instructionsForm.get('timeZone')?.valueChanges.subscribe(newTimeZone => {
      if (newTimeZone) {
        this.adjustTimesForTimeZone(newTimeZone);
      }
    });
  }

  /**
   * Ajuster les heures selon le nouveau fuseau horaire
   */
  private adjustTimesForTimeZone(timeZone: string): void {
    const checkInTime = this.instructionsForm.get('checkInTime')?.value;
    const checkOutTime = this.instructionsForm.get('checkOutTime')?.value;

    if (checkInTime && checkOutTime) {
      // Réajuster les heures selon le nouveau fuseau (optionnel)
      // Pour l'instant, on garde les heures locales telles quelles
      console.log(`Timezone changed to: ${timeZone}`);
    }
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
   * Convertir les heures UTC reçues vers le fuseau horaire local
   */
  private populateForm(instructions: UnitInstructionsGetModel): void {
    const timeZone = instructions.checkTimes?.timeZone || 'UTC';

    // Convertir les heures UTC reçues du backend vers le fuseau horaire choisi
    let checkInTime = new Date();
    let checkOutTime = new Date();

    if (instructions.checkTimes?.checkInTime) {
      // Créer un moment UTC et le convertir vers le fuseau horaire
      const utcCheckIn = moment.utc(instructions.checkTimes.checkInTime, 'HH:mm');
      const localCheckIn = utcCheckIn.tz(timeZone);

      checkInTime.setHours(localCheckIn.hour(), localCheckIn.minute(), 0, 0);
    } else {
      checkInTime.setHours(15, 0, 0, 0);
    }

    if (instructions.checkTimes?.checkOutTime) {
      // Créer un moment UTC et le convertir vers le fuseau horaire
      const utcCheckOut = moment.utc(instructions.checkTimes.checkOutTime, 'HH:mm');
      const localCheckOut = utcCheckOut.tz(timeZone);

      checkOutTime.setHours(localCheckOut.hour(), localCheckOut.minute(), 0, 0);
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
   * Convertir les heures locales vers UTC avant envoi au backend
   */
  onSave(): void {
    if (this.instructionsForm.valid) {
      this.isSaving = true;
      const formValue = this.instructionsForm.value;

      // Convertir les heures locales vers UTC selon le fuseau horaire sélectionné
      const checkInTimeString = this.formatTimeForApiWithTimezone(
        formValue.checkInTime,
        formValue.timeZone
      );
      const checkOutTimeString = this.formatTimeForApiWithTimezone(
        formValue.checkOutTime,
        formValue.timeZone
      );

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

      console.log('Payload to be sent:', JSON.stringify(payload, null, 2));

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
   * Convertir une heure locale vers UTC selon le fuseau horaire
   */
  private formatTimeForApiWithTimezone(date: Date, timeZone: string): string {
    if (!date || !timeZone) return '';

    // Créer un moment dans le fuseau horaire spécifié
    const localTime = moment.tz({
      hour: date.getHours(),
      minute: date.getMinutes()
    }, timeZone);

    // Convertir vers UTC
    const utcTime = localTime.utc();

    // Retourner au format HH:mm
    return utcTime.format('HH:mm');
  }

  /**
   * Convertir un objet Date en format HH:mm simple (sans conversion timezone)
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
   * Getter pour le debug payload - montre les conversions timezone
   */
  get debugPayload(): any {
    const formValue = this.instructionsForm.value;

    return {
      localTimes: {
        checkInTime: this.formatTimeForApi(formValue.checkInTime),
        checkOutTime: this.formatTimeForApi(formValue.checkOutTime),
        timeZone: formValue.timeZone
      },
      utcTimes: {
        checkInTime: this.formatTimeForApiWithTimezone(formValue.checkInTime, formValue.timeZone),
        checkOutTime: this.formatTimeForApiWithTimezone(formValue.checkOutTime, formValue.timeZone),
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
