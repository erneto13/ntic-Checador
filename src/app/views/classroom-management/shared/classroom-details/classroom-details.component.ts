import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AssignTabComponent } from '../assign-tab/assign-tab.component';
import { ScheduleTabComponent } from '../schedule-tab/schedule-tab.component';
import { CommonModule } from '@angular/common';
import { ClassroomResponse } from '../../../../core/interfaces/classroom';
import { DialogModule } from 'primeng/dialog';
import { ScheduleFormComponent } from "./shared/schedule-form/schedule-form.component";

@Component({
  selector: 'app-classroom-details',
  standalone: true,
  imports: [CommonModule, ScheduleTabComponent,
    DialogModule, ScheduleFormComponent],
  templateUrl: './classroom-details.component.html',
})
export class ClassroomDetailsComponent {
  @Input() classroom?: ClassroomResponse;
  @Output() panelClosed = new EventEmitter<void>();
  @Output() assignClass = new EventEmitter<any>();
  @Output() scheduleCreated = new EventEmitter<void>();

  showDetailsModal: boolean = false;

  onAssignClass(event: any) {
    this.assignClass.emit(event);
  }

  openModal() {
    this.showDetailsModal = true;
  }

  handleScheduleCreated() {
    this.scheduleCreated.emit();
    this.showDetailsModal = false;
  }
}
