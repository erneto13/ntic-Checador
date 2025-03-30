import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Classroom, ClassroomResponse } from '../../../../core/interfaces/classroom';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assign-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-tab.component.html',
})
export class AssignTabComponent {
  @Input() classroom?: ClassroomResponse;
  @Output() assignClass = new EventEmitter<any>();

  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  timeSlots = [
    { value: '12:00', display: '12:00 PM' },
    // ... más horas
  ];
  
  professors = [
    { id: 1, name: 'Profesor 1' },
    // ... más profesores
  ];
  
  courses = [
    { id: 1, name: 'Curso 1' },
    // ... más cursos
  ];

  selectedDay: string = this.weekDays[0];
  selectedTime: string = this.timeSlots[0].value;
  selectedProfessor?: number;
  selectedCourse?: number;

  _assignClass() {
    this.assignClass.emit({
      classroomId: this.classroom?.id,
      day: this.selectedDay,
      time: this.selectedTime,
      professorId: this.selectedProfessor,
      courseId: this.selectedCourse
    });
  }
}
