import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UnitApiService } from '../../../../services/unit-api.service';
import { UnitItemGetModel } from '../../../../models/unit-item-get.model';
import {
  ButtonDirective, ColComponent, RowComponent, FormDirective,
  FormControlDirective, FormLabelDirective, FormFeedbackComponent,
  FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective
} from '@coreui/angular';
import {NgxIntlTelInputModule} from "ngx-intl-tel-input";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sub-unit-edit-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslatePipe, ColComponent, RowComponent,
    FormDirective, FormControlDirective, FormLabelDirective, FormFeedbackComponent,
    FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, NgxIntlTelInputModule
  ],
  templateUrl: './sub-unit-edit-modal.component.html',
  styleUrl: './sub-unit-edit-modal.component.scss'
})
export class SubUnitEditModalComponent implements OnInit, OnDestroy {

  subUnitForm: FormGroup;
  isSubmitting: boolean = false;
  subUnit!: UnitItemGetModel;

  @Output() subUnitUpdated = new EventEmitter<any>();

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private modalRef: BsModalRef,
    private unitApiService: UnitApiService,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {
    this.subUnitForm = this.fb.group({
      name: ['', [Validators.required]],
      priority: [1, [Validators.required, Validators.min(1)]],
      readiness: [false]
    });
  }

  ngOnInit(): void {
    if (this.subUnit) {
      this.subUnitForm.patchValue({
        name: this.subUnit.name,
        priority: this.subUnit.priority || 1,
        readiness: this.subUnit.readiness
      });
    }
  }

  onSubmit(): void {
    if (this.subUnitForm.invalid) {
      this.subUnitForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.subUnitForm.value;

    const payload = {
      name: formValue.name.trim(),
      priority: formValue.priority,
      readiness: formValue.readiness
    };

    console.log('Updating SubUnit:', payload);

    this.subscriptions.push(
      this.unitApiService.updateUnitInfosById(this.subUnit.id, payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.subUnitUpdated.emit(response);
          this.closeModal();
          this.toastrService.info(
            `SubUnit "${payload.name}" updated successfully`,
            'SubUnit Updated'
          );
        },
        error: (err) => {
          console.error('Error updating subUnit:', err);
          this.isSubmitting = false;
          this.toastrService.error(
            'Failed to update SubUnit. Please try again.',
            'Update Failed'
          );
        }
      })
    );
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
