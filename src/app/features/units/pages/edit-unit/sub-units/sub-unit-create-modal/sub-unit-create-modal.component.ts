import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UnitApiService } from '../../../../services/unit-api.service';
import {
  ButtonDirective, ColComponent, RowComponent, FormDirective,
  FormControlDirective, FormLabelDirective, FormFeedbackComponent,
  FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilTrash } from '@coreui/icons';
import { UnitSelectComponent } from '../../../../../../shared/components/unit-select/unit-select.component';
import {CommonModule} from "@angular/common";
import {NgxIntlTelInputModule} from "ngx-intl-tel-input";

@Component({
  selector: 'app-sub-unit-create-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslatePipe, ButtonDirective, ColComponent, RowComponent,
    FormDirective, FormControlDirective, FormLabelDirective, FormFeedbackComponent,
    FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, IconDirective,
    UnitSelectComponent, NgxIntlTelInputModule
  ],
  templateUrl: './sub-unit-create-modal.component.html',
  styleUrl: './sub-unit-create-modal.component.scss'
})
export class SubUnitCreateModalComponent implements OnDestroy {

  subUnitsForm: FormGroup;
  isSubmitting: boolean = false;
  multiUnitId!: string;
  icons = { cilTrash };

  @Output() subUnitCreated = new EventEmitter<any>();

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private modalRef: BsModalRef,
    private unitApiService: UnitApiService,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {
    this.subUnitsForm = this.fb.group({
      newSubUnits: this.fb.array([]),
      existingUnits: [null]
    });
  }

  get newSubUnits(): FormArray {
    return this.subUnitsForm.get('newSubUnits') as FormArray;
  }

  addNewSubUnit(): void {
    if (this.newSubUnits.length >= 10) {
      this.toastrService.warning('Maximum 10 subunits allowed', 'Limit Reached');
      return;
    }

    const subUnitGroup = this.fb.group({
      name: ['', [Validators.required]],
      priority: [this.getNextPriority(), [Validators.required, Validators.min(1)]],
      readiness: [false]
    });

    this.newSubUnits.push(subUnitGroup);
  }

  removeNewSubUnit(index: number): void {
    this.newSubUnits.removeAt(index);
  }

  private getNextPriority(): number {
    const existingPriorities = this.newSubUnits.controls
      .map(control => control.get('priority')?.value)
      .filter(priority => priority !== null && priority !== undefined)
      .map(priority => Number(priority))
      .sort((a, b) => a - b);

    for (let i = 1; i <= existingPriorities.length + 1; i++) {
      if (!existingPriorities.includes(i)) {
        return i;
      }
    }
    return existingPriorities.length + 1;
  }

  hasValidSubUnits(): boolean {
    const hasNewSubUnits = this.newSubUnits.controls.some(control =>
      control.get('name')?.value &&
      control.get('name')?.value.trim() &&
      control.valid
    );

    const hasExistingUnits = this.subUnitsForm.get('existingUnits')?.value &&
      this.subUnitsForm.get('existingUnits')?.value.length > 0;

    return hasNewSubUnits || hasExistingUnits;
  }

  onSubmit(): void {
    if (!this.hasValidSubUnits()) {
      this.newSubUnits.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.subUnitsForm.value;
    const subUnits: any[] = [];

    // Ajouter les nouveaux SubUnits
    if (formValue.newSubUnits && formValue.newSubUnits.length > 0) {
      formValue.newSubUnits.forEach((subUnit: any) => {
        if (subUnit.name && subUnit.name.trim()) {
          subUnits.push({
            name: subUnit.name.trim(),
            priority: subUnit.priority,
            readiness: subUnit.readiness
          });
        }
      });
    }

    // Ajouter les unités existantes
    if (formValue.existingUnits && formValue.existingUnits.length > 0) {
      formValue.existingUnits.forEach((unit: any) => {
        subUnits.push({
          unitId: unit.id
        });
      });
    }

    const payload = { subUnits: subUnits };

    console.log('Creating SubUnits with payload:', payload);

    this.subscriptions.push(
      this.unitApiService.postSubUnit(this.multiUnitId, payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.subUnitCreated.emit(response);
          this.closeModal();

          this.toastrService.success(
            `${subUnits.length} SubUnit${subUnits.length > 1 ? 's' : ''} added successfully`,
            'SubUnits Added'
          );
        },
        error: (err) => {
          console.error('Error creating subUnits:', err);
          this.isSubmitting = false;
          this.toastrService.error(
            'Failed to add SubUnits. Please try again.',
            'Creation Failed'
          );
        }
      })
    );
  }

  closeModal(): void {
    this.modalRef.hide();
    this.subUnitsForm.reset();

    // Réinitialiser le FormArray
    while (this.newSubUnits.length !== 0) {
      this.newSubUnits.removeAt(0);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
