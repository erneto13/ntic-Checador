import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AssignTabComponent } from '../assign-tab/assign-tab.component';
import { ScheduleTabComponent } from '../schedule-tab/schedule-tab.component';
import { CommonModule } from '@angular/common';
import { ClassroomResponse } from '../../../../core/interfaces/classroom';

@Component({
  selector: 'app-classroom-details',
  standalone: true,
  imports: [CommonModule, AssignTabComponent, ScheduleTabComponent
  ],
  templateUrl: './classroom-details.component.html',
})
export class ClassroomDetailsComponent {
  @Input() classroom?: ClassroomResponse;
  @Output() panelClosed = new EventEmitter<void>();
  @Output() assignClass = new EventEmitter<any>();

  activeTab: 'schedule' | 'assign' = 'schedule';

  closePanel(event: Event) {
    event.stopPropagation();
    this.panelClosed.emit();
  }

  onAssignClass(event: any) {
    this.assignClass.emit(event);
  }
}
