// simple-dropdown.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-dropdown',
  template: `
    <div class="relative">
      @if (label) {
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
      }
      
      <div class="relative">
        <ng-content select="[icon]"></ng-content>
        
        <div class="pl-10 w-full py-2 border border-gray-300 rounded-md 
                    focus:ring-2 focus:ring-blue-400 focus:border-transparent 
                    text-sm cursor-pointer flex items-center justify-between"
             (click)="isOpen = !isOpen">
          <span class="truncate">
            {{ selectedOption ? getOptionLabel(selectedOption) : placeholder }}
          </span>
          <i class="pi pi-chevron-down text-xs ml-2 transition-transform duration-200" 
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
  `]
})
export class DropdownComponent {
  @Input() options: any[] = [];
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() label: string = '';
  @Input() displayField: string = 'name';
  @Input() valueField: string = 'id';

  @Output() selected = new EventEmitter<any>();

  isOpen = false;
  selectedOption: any = null;

  selectOption(option: any) {
    this.selectedOption = option;
    this.selected.emit(option);
    this.isOpen = false;
  }

  getOptionLabel(option: any): string {
    return option[this.displayField] || option.toString();
  }
}