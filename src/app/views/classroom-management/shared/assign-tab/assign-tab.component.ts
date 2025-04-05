import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Classroom, ClassroomResponse, Professor } from '../../../../core/interfaces/classroom';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassroomService } from '../../service/classroom-service.service';

@Component({
  selector: 'app-assign-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-tab.component.html',
})
export class AssignTabComponent implements OnInit{
  @Input() classroom?: ClassroomResponse;
  @Output() assignClass = new EventEmitter<any>();
  professors: Professor[] = [];
  constructor(private professorService:ClassroomService) {
  }
  ngOnInit(): void {
      this.loadProfessors();
  }
  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  timeSlots = [
    { value: '12:00', display: '12:00 PM' },
    // ... más horas
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
  loadProfessors() {
    this.professorService.getProfessorsByDepartment(this.getDeparmentment(this.classroom?.name!)).subscribe({
      next: (professors) => {
        this.professors = professors;
        console.log('Profesores cargados:', professors);
      },
      error: (error) => {
        console.error('Error al cargar los profesores:', error);
      }
    });
  }
  getDeparmentment(text:string):string{
    const words = text.split(' ');
    return words[words.length - 1];
  }
  getGroupShift(text:string):string{
    const words = text.split(' ');
    return words[words.length - 1];
  }
}
