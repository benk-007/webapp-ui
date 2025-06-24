import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minMaxStayValidator(minField: string, maxField: string): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const group = form as FormGroup;
    const minValue = group.get(minField)?.value;
    const maxValue = group.get(maxField)?.value;

    if (minValue == null || maxValue == null) {
      return null;
    }

    if (maxValue < minValue) {
      return { maxLowerThanMin: true };
    }

    return null;
  };
}
