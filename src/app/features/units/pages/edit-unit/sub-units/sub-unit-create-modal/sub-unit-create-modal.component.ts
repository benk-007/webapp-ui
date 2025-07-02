import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-sub-unit-create-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule, TranslatePipe, ButtonDirective, ColComponent, RowComponent,
    FormDirective, FormControlDirective, FormLabelDirective, FormFeedbackComponent,
    FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective
  ],
  templateUrl: './sub-unit-create-modal.component.html',
  styleUrl: './sub-unit-create-modal.component.scss'
})
export class SubUnitCreateModalComponent implements OnDestroy {

  subUnitForm: FormGroup;
  isSubmitting: boolean = false;
  multiUnitId!: string;

  @Output() subUnitCreated = new EventEmitter<any>();

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
      readiness: formValue.readiness,
      parentUnitId: this.multiUnitId
    };

    // TODO: Appel API pour créer la subUnit
    console.log('Creating subUnit:', payload);

    // Simulation pour l'instant
    setTimeout(() => {
      this.isSubmitting = false;
      this.subUnitCreated.emit(payload);
      this.closeModal();
      this.toastrService.success('SubUnit created successfully', 'Success');
    }, 1000);
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
