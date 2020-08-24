// outer imports
import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
// imports end

export class CommonValidators {
  public static atLeastOne = (validator: ValidatorFn, controls: string[] = null) => (
    group: FormGroup
  ): ValidationErrors | null => {
    if (!controls) {
      controls = Object.keys(group.controls);
    }

    const hasAtLeastOne = group && group.controls && controls
      .some(k => !validator(group.controls[k]));

    return hasAtLeastOne ? null : {
      atLeastOne: true
    };
  };
}