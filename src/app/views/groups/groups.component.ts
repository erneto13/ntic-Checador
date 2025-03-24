import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './groups.component.html',
})
export default class GroupsComponent {
  // Estado para el panel lateral y modal
  showPanel: boolean = false;
  showModal: boolean = false;
  activeTab: 'schedule' | 'assign' = 'schedule';

  // Salón seleccionado actualmente
  selectedClassroom: any = null;

  // Datos para el formulario de asignación
  selectedDay: string = 'Lunes';
  selectedTime: string = '12';
  selectedProfessor: string = '';
  selectedCourse: string = '';

  // Datos para el formulario de nuevo salón
  newClassroom: any = {
    name: '',
    description: '',
    code: '',
    capacity: null,
    status: 'available'
  };

  // Datos de ejemplo
  weekDays: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  timeSlots: any[] = [
    { value: '12', display: '12:00 - 13:00' },
    { value: '13', display: '13:00 - 14:00' },
    { value: '14', display: '14:00 - 15:00' },
    { value: '15', display: '15:00 - 16:00' },
    { value: '16', display: '16:00 - 17:00' },
    { value: '17', display: '17:00 - 18:00' },
    { value: '18', display: '18:00 - 19:00' },
    { value: '19', display: '19:00 - 20:00' },
    { value: '20', display: '20:00 - 21:00' },
    { value: '21', display: '21:00 - 22:00' }
  ];

  professors: any[] = [
    { id: 'martinez', name: 'Dr. Yobani' },
    { id: 'lopez', name: 'Gibran' },
    { id: 'ramirez', name: 'Pikolin' },
    { id: 'angel', name: 'Jelty' },
    { id: 'rodriguez', name: 'Teiker' }
  ];

  courses: any[] = [
    { id: 'math101', name: 'Teoria de Peda' },
    { id: 'phys201', name: 'Cawameada II' },
    { id: 'chem301', name: 'Introducción al Golleteo' },
    { id: 'bio401', name: 'Fubol' },
    { id: 'cs501', name: 'Ciencias de la Computación' }
  ];

  // Lista de salones
  classrooms: any[] = [
    {
      id: 1,
      name: '402',
      description: 'los zzz',
      code: 'SA101',
      capacity: 19,
      status: 'available',
      schedule: {
        'Lunes': { '12': 'martinez', '13': 'martinez' },
        'Miércoles': { '12': 'martinez', '13': 'martinez' }
      }
    },
    {
      id: 2,
      name: '401',
      description: 'Los buenos.',
      code: 'SB202',
      capacity: 7,
      status: 'partial',
      schedule: {
        'Martes': { '14': 'lopez' },
        'Jueves': { '14': 'lopez' }
      }
    },
    {
      id: 3,
      name: '403',
      description: 'y estos random?',
      code: 'SC303',
      capacity: 5,
      status: 'occupied',
      schedule: {
        'Lunes': { '12': 'rodriguez', '13': 'rodriguez', '14': 'rodriguez' },
        'Martes': { '12': 'rodriguez', '13': 'rodriguez', '14': 'rodriguez' },
        'Miércoles': { '12': 'rodriguez', '13': 'rodriguez', '14': 'rodriguez' },
        'Jueves': { '12': 'rodriguez', '13': 'rodriguez', '14': 'rodriguez' },
        'Viernes': { '12': 'rodriguez', '13': 'rodriguez', '14': 'rodriguez' }
      }
    }
  ];

  // Métodos para manejar eventos
  openClassroomMenu(classroom: any): void {
    this.selectedClassroom = classroom;
    this.showPanel = true;
  }

  closePanel(event: MouseEvent): void {
    // Solo cerrar si se hace clic fuera del panel
    if ((event.target as HTMLElement).classList.contains('bg-black/50')) {
      this.showPanel = false;
    }
  }

  openModal(): void {
    this.showModal = true;
    this.newClassroom = {
      name: '',
      description: '',
      code: '',
      capacity: null,
      status: 'available'
    };
  }

  closeModal(event: MouseEvent): void {
    // Solo cerrar si se hace clic fuera del modal
    if ((event.target as HTMLElement).classList.contains('bg-black/50')) {
      this.showModal = false;
    }
  }

  saveClassroom(): void {
    // Aquí iría la lógica para guardar el nuevo salón
    const newId = this.classrooms.length + 1;
    const classroom = {
      ...this.newClassroom,
      id: newId,
      schedule: {}
    };

    this.classrooms.push(classroom);
    this.showModal = false;

    // Mostrar mensaje de éxito (en una aplicación real usarías un servicio de notificaciones)
    alert('Salón guardado correctamente');
  }

  assignClass(): void {
    if (!this.selectedProfessor || !this.selectedCourse) {
      alert('Por favor selecciona un profesor y un curso');
      return;
    }

    // Inicializar la estructura si no existe
    if (!this.selectedClassroom.schedule) {
      this.selectedClassroom.schedule = {};
    }

    if (!this.selectedClassroom.schedule[this.selectedDay]) {
      this.selectedClassroom.schedule[this.selectedDay] = {};
    }

    // Asignar el profesor al horario seleccionado
    this.selectedClassroom.schedule[this.selectedDay][this.selectedTime] = this.selectedProfessor;

    // Actualizar el estado del salón
    this.updateClassroomStatus(this.selectedClassroom);

    // Mostrar mensaje de éxito
    alert('Clase asignada correctamente');

    // Cambiar a la pestaña de horario para ver el cambio
    this.activeTab = 'schedule';
  }

  // Método para obtener el profesor programado para un día y hora específicos
  getScheduledProfessor(day: string, time: string): string {
    if (!this.selectedClassroom || !this.selectedClassroom.schedule) {
      return '-';
    }

    if (!this.selectedClassroom.schedule[day] || !this.selectedClassroom.schedule[day][time]) {
      return '-';
    }

    const professorId = this.selectedClassroom.schedule[day][time];
    const professor = this.professors.find(p => p.id === professorId);

    return professor ? professor.name : '-';
  }

  // Método para actualizar el estado del salón basado en su ocupación
  updateClassroomStatus(classroom: any): void {
    let totalSlots = this.weekDays.length * this.timeSlots.length;
    let occupiedSlots = 0;

    // Contar slots ocupados
    for (const day in classroom.schedule) {
      for (const time in classroom.schedule[day]) {
        if (classroom.schedule[day][time]) {
          occupiedSlots++;
        }
      }
    }

    // Determinar estado
    if (occupiedSlots === 0) {
      classroom.status = 'available';
    } else if (occupiedSlots < totalSlots / 2) {
      classroom.status = 'partial';
    } else {
      classroom.status = 'occupied';
    }
  }

  // Método para obtener el texto de estado
  getStatusText(status: string): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'partial': return 'Parcialmente ocupado';
      case 'occupied': return 'Ocupado';
      default: return '';
    }
  }
}
