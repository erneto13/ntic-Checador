import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
})
export default class AttendanceComponent {
  // Pestañas principales
  activeMainTab: 'classrooms' | 'attendance' | 'syllabus' = 'attendance';

  // Datos de filtros para asistencias
  selectedGroup: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
  currentSupervisor: string = '';

  // Datos para mostrar en asistencias
  selectedGroupName: string = '';
  selectedGroupClassroom: string = '';

  // Datos de asistencia
  groupSchedules: any[] = [];

  // Datos para temarios
  selectedProfessor: string = '';
  selectedCourse: string = '';
  selectedPeriod: string = 'current';
  professorCourses: any[] = [];
  courseSessions: any[] = [];
  selectedSession: any = null;

  // Alerta
  showAlert: boolean = false;
  alertType: 'success' | 'error' = 'success';
  alertTitle: string = '';
  alertMessage: string = '';

  // Datos de ejemplo
  groups: any[] = [
    { id: '401-15', name: 'Grupo 401-15', classroom: 'Aula 07' },
    { id: '402-15', name: 'Grupo 402-15', classroom: 'Aula 12' },
    { id: '403-15', name: 'Grupo 403-15', classroom: 'Aula 15' }
  ];

  supervisors: any[] = [
    { id: 'sup1', name: 'Juan Pérez' },
    { id: 'sup2', name: 'María González' },
    { id: 'sup3', name: 'Carlos Rodríguez' }
  ];

  professorsList: any[] = [
    { id: 'prof1', name: 'José Miguel' },
    { id: 'prof2', name: 'Herman Corona' },
    { id: 'prof3', name: 'Rocío Jaqueline' },
    { id: 'prof4', name: 'Mirna Paolo' },
    { id: 'prof5', name: 'Edgar Omar' }
  ];

  // Datos de ejemplo para las gráficas
  attendanceData = {
    supervisor: [
      { category: 'Lunes', value: 85 },
      { category: 'Martes', value: 92 },
      { category: 'Miércoles', value: 78 },
      { category: 'Jueves', value: 95 },
      { category: 'Viernes', value: 88 }
    ],
    student: [
      { category: 'Lunes', value: 80 },
      { category: 'Martes', value: 85 },
      { category: 'Miércoles', value: 75 },
      { category: 'Jueves', value: 90 },
      { category: 'Viernes', value: 82 }
    ],
    professor: [
      { category: 'Lunes', value: 95 },
      { category: 'Martes', value: 98 },
      { category: 'Miércoles', value: 92 },
      { category: 'Jueves', value: 100 },
      { category: 'Viernes', value: 96 }
    ]
  };

  constructor() { }

  ngOnInit(): void {
    // Cargar datos iniciales
    this.loadGroupSchedule();
  }

  // Métodos para la pestaña de Asistencias
  loadGroupSchedule(): void {
    // En una aplicación real, aquí cargarías los datos del servidor
    if (!this.selectedGroup) {
      this.groupSchedules = [];
      this.selectedGroupName = '';
      this.selectedGroupClassroom = '';
      return;
    }

    // Encontrar el grupo seleccionado
    const group = this.groups.find(g => g.id === this.selectedGroup);
    if (group) {
      this.selectedGroupName = group.name;
      this.selectedGroupClassroom = group.classroom;
    }

    // Datos de ejemplo para el horario del grupo
    this.groupSchedules = [
      {
        time: '14:00-15:00',
        subject: 'Innovación',
        professor: 'José Miguel',
        attended: false
      },
      {
        time: '15:00-16:00',
        subject: 'Graficación',
        professor: 'Herman Corona',
        attended: false
      },
      {
        time: '16:00-17:00',
        subject: 'Sistemas Digital',
        professor: 'Rocío Jaqueline',
        attended: false
      },
      {
        time: '17:00-18:00',
        subject: 'Computación Ubicua',
        professor: 'Mirna Paolo',
        attended: false
      },
      {
        time: '18:00-19:00',
        subject: 'Redes Neuronales',
        professor: 'Edgar Omar',
        attended: false
      }
    ];
  }

  confirmAttendance(schedule: any): void {
    if (!this.currentSupervisor) {
      this.showErrorAlert('Supervisor no seleccionado', 'Por favor seleccione un supervisor antes de registrar la asistencia.');
      schedule.attended = !schedule.attended; // Revertir el cambio
      return;
    }

    const status = schedule.attended ? 'asistencia' : 'inasistencia';
    const supervisor = this.supervisors.find(s => s.id === this.currentSupervisor)?.name || 'Supervisor';

    this.showSuccessAlert(
      'Registro exitoso',
      `Se ha registrado la ${status} del profesor ${schedule.professor} para la clase de ${schedule.subject} a las ${schedule.time} por ${supervisor}.`
    );

    // En una aplicación real, aquí enviarías los datos al servidor
  }

  // Métodos para la pestaña de Programar Temarios
  loadProfessorCourses(): void {
    // En una aplicación real, aquí cargarías los datos del servidor
    if (!this.selectedProfessor) {
      this.professorCourses = [];
      this.selectedCourse = '';
      this.courseSessions = [];
      this.selectedSession = null;
      return;
    }

    // Datos de ejemplo para las materias del profesor
    this.professorCourses = [
      {
        id: 'course1',
        name: 'Innovación',
        group: 'Grupo 401-15'
      },
      {
        id: 'course2',
        name: 'Graficación',
        group: 'Grupo 402-15'
      },
      {
        id: 'course3',
        name: 'Sistemas Digital',
        group: 'Grupo 403-15'
      }
    ];
  }

  loadCourseSessions(): void {
    // En una aplicación real, aquí cargarías los datos del servidor
    if (!this.selectedCourse) {
      this.courseSessions = [];
      this.selectedSession = null;
      return;
    }

    // Datos de ejemplo para las sesiones del curso
    this.courseSessions = [
      {
        id: 'session1',
        title: 'Introducción a la materia',
        date: '2025-03-25',
        objectives: 'Conocer los conceptos básicos de la materia y su aplicación en el mundo real.',
        topics: '- Presentación del curso\n- Conceptos fundamentales\n- Aplicaciones prácticas',
        materials: 'Libro de texto, presentaciones, artículos científicos',
        activities: 'Discusión grupal, ejercicios prácticos',
        status: 'completed'
      },
      {
        id: 'session2',
        title: 'Fundamentos teóricos',
        date: '2025-04-01',
        objectives: 'Comprender los fundamentos teóricos que sustentan la materia.',
        topics: '- Teorías principales\n- Modelos conceptuales\n- Evolución histórica',
        materials: 'Capítulos 2 y 3 del libro de texto, videos educativos',
        activities: 'Análisis de casos, presentaciones individuales',
        status: 'in-progress'
      },
      {
        id: 'session3',
        title: 'Aplicaciones prácticas',
        date: '2025-04-08',
        objectives: 'Aplicar los conocimientos teóricos en situaciones prácticas.',
        topics: '- Metodologías de aplicación\n- Herramientas tecnológicas\n- Casos de estudio',
        materials: 'Software especializado, guías de laboratorio',
        activities: 'Proyecto en equipo, demostraciones prácticas',
        status: 'planned'
      }
    ];
  }

  selectSession(session: any): void {
    // Crear una copia para no modificar directamente el original
    this.selectedSession = JSON.parse(JSON.stringify(session));
  }

  createNewSession(): void {
    const today = new Date().toISOString().split('T')[0];

    this.selectedSession = {
      id: 'new-session-' + Date.now(),
      title: 'Nueva Sesión',
      date: today,
      objectives: '',
      topics: '',
      materials: '',
      activities: '',
      status: 'planned'
    };
  }

  saveSession(): void {
    // Validar campos obligatorios
    if (!this.selectedSession.title || !this.selectedSession.date) {
      this.showErrorAlert('Campos incompletos', 'Por favor complete al menos el título y la fecha de la sesión.');
      return;
    }

    // En una aplicación real, aquí enviarías los datos al servidor

    // Actualizar la lista de sesiones
    const index = this.courseSessions.findIndex(s => s.id === this.selectedSession.id);
    if (index >= 0) {
      // Actualizar sesión existente
      this.courseSessions[index] = JSON.parse(JSON.stringify(this.selectedSession));
    } else {
      // Añadir nueva sesión
      this.courseSessions.push(JSON.parse(JSON.stringify(this.selectedSession)));
    }

    this.showSuccessAlert(
      'Sesión guardada',
      `La sesión "${this.selectedSession.title}" ha sido guardada correctamente.`
    );
  }

  cancelEditing(): void {
    // Si estaba editando una sesión existente, volver a cargarla
    if (this.selectedSession && this.selectedSession.id.startsWith('new-session-')) {
      this.selectedSession = null;
    } else if (this.selectedSession) {
      const originalSession = this.courseSessions.find(s => s.id === this.selectedSession.id);
      if (originalSession) {
        this.selectedSession = JSON.parse(JSON.stringify(originalSession));
      } else {
        this.selectedSession = null;
      }
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in-progress': return 'En Progreso';
      case 'planned': return 'Planeada';
      case 'cancelled': return 'Cancelada';
      default: return '';
    }
  }

  // Métodos comunes
  showSuccessAlert(title: string, message: string): void {
    this.alertType = 'success';
    this.alertTitle = title;
    this.alertMessage = message;
    this.showAlert = true;
  }

  showErrorAlert(title: string, message: string): void {
    this.alertType = 'error';
    this.alertTitle = title;
    this.alertMessage = message;
    this.showAlert = true;
  }

  closeAlert(): void {
    this.showAlert = false;
  }

}
