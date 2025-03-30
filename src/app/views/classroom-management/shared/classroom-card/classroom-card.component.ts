import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Classroom, ClassroomResponse } from '../../../../core/interfaces/classroom';
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
  @Output() onClick = new EventEmitter<Classroom>();
  @Output() onDelete = new EventEmitter<Classroom>();
  @Output() onEdit = new EventEmitter<Classroom>();

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
