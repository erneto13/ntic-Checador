import { Component, OnInit } from '@angular/core';
import { ToastComponent } from "../../shared/toast/toast.component";
import { ClassSession } from '../../core/interfaces/groups';
import { ClassSessionService } from './services/class-session.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-class-session',
  standalone: true,
  imports: [ToastComponent],
  templateUrl: './class-session.component.html',
})
export default class ClassSessionComponent implements OnInit {
  classSessions!: ClassSession[]

  constructor(
    private classService: ClassSessionService,
    private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadClassSessions();
  }

  loadClassSessions(): void {
    this.classService.getAllClassSession().subscribe({
      next: (data: any) => {
        this.classSessions = data;
      },
      error: (error: any) => {
        this.toastService.showToast(
          'Error al cargar las clases',
          'No se pudieron cargar las sesiones de clase. Por favor, inténtalo de nuevo más tarde.',
          'error'
        );
      }
    });
  }
}
