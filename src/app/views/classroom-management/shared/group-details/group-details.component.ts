import { Component, Input } from '@angular/core';
import { GroupResponse } from '../../../../core/interfaces/groups';
import { Observable } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ClassSessionFormComponent } from "../../../class-session/shared/class-session-form/class-session-form.component";
import ClassSessionComponent from '../../../class-session/class-session.component';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [ClassSessionComponent, DialogModule, ClassSessionFormComponent],
  templateUrl: './group-details.component.html',
})
export class GroupDetailsComponent {
  @Input() group!: GroupResponse;

  modalClassSession = false;
  shouldRefreshSessions = false;

  handleScheduleForm(): void {
    this.modalClassSession = true;
  }

  handleFormSubmit() {
    this.modalClassSession = false;
    this.shouldRefreshSessions = !this.shouldRefreshSessions; 
  }
}
