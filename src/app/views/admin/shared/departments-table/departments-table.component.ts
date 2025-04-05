import { Component, EventEmitter, Input } from '@angular/core';
import { DepartmentResponse } from '../../../../core/interfaces/department';

@Component({
  selector: 'app-departments-table',
  standalone: true,
  imports: [],
  templateUrl: './departments-table.component.html',
})
export class DepartmentsTableComponent {
  @Input() departments: DepartmentResponse[] = [];
  @Input() isLoading: boolean = false;
  @Input() delete = new EventEmitter<number>();
  @Input() edit = new EventEmitter<DepartmentResponse>();
  columnas: any[] = ["Nombre", "Acciones"];

  deleteDepartment(id: number): void {
    this.delete.emit(id);
  }

  editDepartment(department: DepartmentResponse): void {
    this.edit.emit(department);
  }
}
