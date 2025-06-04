import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-dropdown',
  template: `
    <div class="relative">
      @if (label) {
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
      }
      
      <div class="relative">
        <div class="pl-4 w-full py-2 border border-gray-300 rounded-md 
                    focus:ring-2 focus:ring-blue-400 focus:border-transparent 
                    text-sm cursor-pointer flex items-center justify-between"
             (click)="isOpen = !isOpen">
          <span class="truncate">
            {{ selectedOption ? getOptionLabel(selectedOption) : placeholder }}
          </span>
          <i class="pi pi-chevron-down text-xs mr-2 transition-transform duration-200" 
             [class.rotate-180]="isOpen"></i>
        </div>
        
        @if (isOpen) {
          <div class="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md 
                    border border-gray-200 max-h-60 overflow-auto py-1 text-sm">
            @for (option of options; track $index) {
              <div 
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                (click)="selectOption(option)">
                {{ getOptionLabel(option) }}
              </div>
            }
          </div>
        } 
      </div>
    </div>
  `,
  styles: [`
    .rotate-180 {
      transform: rotate(180deg);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() label: string = '';
  @Input() displayField: string = 'name';
  @Input() valueField: string = 'id';
  @Input() objectField!: any[];

  @Output() selected = new EventEmitter<any>();

  isOpen = false;
  selectedOption: any = null;
  disabled = false;

  onChange: any = () => { };
  onTouched: any = () => { };

  selectOption(option: any) {
    this.selectedOption = option;
    this.onChange(option[this.valueField]); 
    this.onTouched();
    this.selected.emit(option);
    this.isOpen = false;
  }

  getOptionLabel(option: any): string {
    return option[this.displayField] || option.toString();
  }

  writeValue(value: any): void {
    if (value) {
      this.selectedOption = this.options.find(opt => opt[this.valueField] === value);
    } else {
      this.selectedOption = null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}