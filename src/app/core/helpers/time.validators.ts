import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class TimeValidator {
    static validate(startTimeField: string, endTimeField: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const startTime = control.get(startTimeField)?.value;
            const endTime = control.get(endTimeField)?.value;

            if (!startTime || !endTime) {
                return null;
            }

            const start = new Date(`1970-01-01T${startTime}`);
            const end = new Date(`1970-01-01T${endTime}`);

            return start >= end ? { timeConflict: true } : null;
        };
    }
}
