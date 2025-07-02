import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UnitApiService } from '../../../../services/unit-api.service';
import { UnitSelectComponent } from '../../../../../../shared/components/unit-select/unit-select.component';
import {
  ButtonDirective, ColComponent, RowComponent, FormDirective,
  FormLabelDirective, FormFeedbackComponent
} from '@coreui/angular';

@Component({
  selector: 'app-existing-unit-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule, TranslatePipe, ButtonDirective, ColComponent, RowComponent,
    FormDirective, FormLabelDirective, FormFeedbackComponent, UnitSelectComponent
  ],
  templateUrl: './existing-unit-modal.component.html',
  styleUrl: './existing-unit-modal.component.scss'
})
export class ExistingUnitModalComponent implements OnDestroy {

  assignForm: FormGroup;
  isSubmitting: boolean = false;
  multiUnitId!: string;

  @Output() unitAssigned = new EventEmitter<any>();

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private modalRef: BsModalRef,
    private unitApiService: UnitApiService,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {
    this.assignForm = this.fb.group({
      selectedUnits: [null, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const selectedUnits = this.assignForm.value.selectedUnits;

    // TODO: Appel API pour assigner les unités comme subUnits
    console.log('Assigning units as subUnits:', selectedUnits);

    // Simulation pour l'instant
    setTimeout(() => {
      this.isSubmitting = false;
      this.unitAssigned.emit(selectedUnits);
      this.closeModal();
      this.toastrService.success('Units assigned successfully', 'Success');
    }, 1000);
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
