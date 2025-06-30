import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {
  ButtonDirective,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  RowComponent
} from "@coreui/angular";
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {BsModalRef} from "ngx-bootstrap/modal";
import {ToastrService} from "ngx-toastr";
import {Subscription} from "rxjs";
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from "ngx-intl-tel-input";
import {emailValidator} from "../../../../shared/validators/email.validator";
import {CountrySelectComponent} from "../../../../shared/components/country-select/country-select.component";
import {noNumbersValidator} from "../../../../shared/validators/no-number.validator";
import {UnitApiService} from "../../services/unit-api.service";
import {UnitSelectComponent} from "../../../../shared/components/unit-select/unit-select.component";
import {CommonModule} from "@angular/common";
import {cilTrash, cilPlus} from "@coreui/icons";
import {MultiUnitPostModel, SubUnitModel} from "../../models/MultiUnitPostModel";

@Component({
  selector: 'app-multi-unit-create-modal',
  standalone: true,
  imports: [
    ButtonDirective,
    ColComponent,
    RowComponent,
    FormControlDirective,
    FormsModule,
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    FormDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    CountrySelectComponent,
    UnitSelectComponent,
    CommonModule,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective
  ],
  templateUrl: './multi-unit-create-modal.component.html',
  styleUrl: './multi-unit-create-modal.component.scss'
})
export class MultiUnitCreateModalComponent implements OnInit, OnDestroy {

  multiUnitForm: FormGroup;
  currentStep: number = 1;
  @Output() actionConfirmed = new EventEmitter<string>();

  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;
  protected readonly icons = {
    cilTrash,
    cilPlus
  };

  private readonly subscriptions: Subscription[] = [];

  public constructor(
    private readonly fb: FormBuilder,
    private readonly unitApiService: UnitApiService,
    private readonly modalRef: BsModalRef,
    private readonly translateService: TranslateService,
    private readonly toastrService: ToastrService
  ) {
    this.multiUnitForm = this.fb.group({
      name: [null, [Validators.required]],
      // Address section
      street1: [null, [Validators.required]],
      street2: [null],
      postcode: [null],
      city: [null, [Validators.required, noNumbersValidator()]],
      country: [null, [Validators.required]],
      // Contact section
      mobile: [null, [Validators.required]],
      email: [null, [emailValidator()]],
      // Existing units selection
      existingUnits: [null],
      // New sub-units array
      newSubUnits: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Add one default subunit
    this.addNewSubUnit();
  }

  get newSubUnits(): FormArray {
    return this.multiUnitForm.get('newSubUnits') as FormArray;
  }

  // Step Navigation Methods
  nextStep(): void {
    if (this.currentStep === 1 && this.isStep1Valid()) {
      this.currentStep = 2;
    }
  }

  previousStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  isStep1Valid(): boolean {
    const nameValid = this.multiUnitForm.get('name')?.valid;
    const hasSubUnits = this.newSubUnits.length > 0 ||
      (this.multiUnitForm.get('existingUnits')?.value &&
        this.multiUnitForm.get('existingUnits')?.value.length > 0);
    const subUnitsValid = this.newSubUnits.valid;

    return !!(nameValid && hasSubUnits && subUnitsValid);
  }

  getPreviewText(): string {
    const newSubUnitsCount = this.newSubUnits.length;
    const existingUnitsCount = this.multiUnitForm.get('existingUnits')?.value?.length || 0;
    const totalUnits = newSubUnitsCount + existingUnitsCount;

    if (totalUnits === 0) {
      return this.translateService.instant('units.create-multi-unit.form.preview.no-units');
    }

    const parts = [];
    if (newSubUnitsCount > 0) {
      parts.push(`${newSubUnitsCount} ${this.translateService.instant('units.create-multi-unit.form.preview.new-units')}`);
    }
    if (existingUnitsCount > 0) {
      parts.push(`${existingUnitsCount} ${this.translateService.instant('units.create-multi-unit.form.preview.existing-units')}`);
    }

    return parts.join(' + ');
  }

  addNewSubUnit(): void {
    const subUnitGroup = this.fb.group({
      name: [null, [Validators.required]],
      priority: [1, [Validators.required, Validators.min(1)]],
      readiness: [false]
    });
    this.newSubUnits.push(subUnitGroup);
  }

  removeNewSubUnit(index: number): void {
    if (this.newSubUnits.length > 1) {
      this.newSubUnits.removeAt(index);
    }
  }

  submit(): void {
    if (!this.multiUnitForm.valid) {
      this.toastrService.warning(
        this.translateService.instant('commons.form.validation-errors'),
        this.translateService.instant('units.create-multi-unit.form.notifications.error.title')
      );
      return;
    }

    const formValue = this.multiUnitForm.value;

    // Build subUnits array
    const subUnits: SubUnitModel[] = [];

    // Add existing units
    if (formValue.existingUnits && formValue.existingUnits.length > 0) {
      formValue.existingUnits.forEach((unit: any) => {
        subUnits.push({
          unitId: unit.id
        });
      });
    }

    // Add new sub-units
    if (formValue.newSubUnits && formValue.newSubUnits.length > 0) {
      formValue.newSubUnits.forEach((subUnit: any) => {
        subUnits.push({
          name: subUnit.name,
          priority: subUnit.priority,
          readiness: subUnit.readiness
        });
      });
    }

    const payload: MultiUnitPostModel = {
      name: formValue.name,
      nature: "MULTI_UNIT",
      address: {
        street1: formValue.street1,
        street2: formValue.street2,
        postCode: formValue.postcode,
        city: formValue.city,
        country: formValue.country
      },
      contact: {
        mobile: formValue.mobile?.e164Number || formValue.mobile,
        email: formValue.email
      },
      subUnits: subUnits
    };

    console.log('Multi-unit payload:', payload);

    // Call API service
    this.subscriptions.push(
      this.unitApiService.postMultiUnit(payload).subscribe({
        next: (data) => {
          console.log('Multi-unit created successfully:', data);
          this.actionConfirmed.emit("");
          this.closeModal();

          const message = this.translateService.instant('units.create-multi-unit.form.notifications.success.message');
          this.toastrService.success(
            message.replace(':unit', data.name),
            this.translateService.instant('units.create-multi-unit.form.notifications.success.title')
          );
        },
        error: (err) => {
          console.error('Error creating multi-unit:', err);
          this.toastrService.error(
            this.translateService.instant('units.create-multi-unit.form.notifications.error.message'),
            this.translateService.instant('units.create-multi-unit.form.notifications.error.title')
          );
        }
      })
    );
  }

  closeModal(): void {
    this.modalRef.hide();
    this.multiUnitForm.reset();
    this.currentStep = 1;
    // Clear the FormArray
    while (this.newSubUnits.length !== 0) {
      this.newSubUnits.removeAt(0);
    }
    // Add one default subunit
    this.addNewSubUnit();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
