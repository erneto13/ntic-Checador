import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SubjectResponse } from '../../../../core/interfaces/subject';

@Component({
  selector: 'app-subjects-table',
  standalone: true,
  imports: [],
  templateUrl: './subjects-table.component.html',
  styleUrl: './subjects-table.component.css'
})
export class SubjectsTableComponent {
  @Input() subjects: SubjectResponse[] = []
  @Input() isLoading: boolean = false
  @Output() delete = new EventEmitter<number>()
  @Output() edit = new EventEmitter<SubjectResponse>()

  columnas: any[] = ["Nombre", "Carrera", "Acciones"]

  deleteSubject(id: number): void {
    this.delete.emit(id)
  }

  editSubject(subject: SubjectResponse): void {
    this.edit.emit(subject)
  }
}
