import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CareerResponse } from '../../../../core/interfaces/career';

@Component({
  selector: 'app-career-table',
  standalone: true,
  imports: [],
  templateUrl: './career-table.component.html',
})
export class CareerTableComponent {
  @Input() careers: CareerResponse[] = []
  @Input() isLoading: boolean = false
  @Output() delete = new EventEmitter<number>()
  @Output() edit = new EventEmitter<CareerResponse>()

  columnas: any[] = ["Nombre", "Acciones"]

  deleteCareer(id: number): void {
    this.delete.emit(id)
  }

  editCareer(career: CareerResponse): void {
    this.edit.emit(career)
  }
}
