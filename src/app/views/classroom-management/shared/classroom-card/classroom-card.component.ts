import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassroomResponse } from '../../../../core/interfaces/classroom';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-classroom-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './classroom-card.component.html',
})
export class ClassroomCardComponent {
  @Input() classroom!: ClassroomResponse;
  @Output() onClick = new EventEmitter<ClassroomResponse>();
  @Output() onDelete = new EventEmitter<ClassroomResponse>();
  @Output() onEdit = new EventEmitter<ClassroomResponse>();

  handleClick() {
    this.onClick.emit(this.classroom);
  }

  handleEdit() {
    this.onEdit.emit(this.classroom);
  }

  handleDelete() {
    this.onDelete.emit(this.classroom);
  }
}
