import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Classroom, Professor } from '../../core/interfaces/classroom';
import { Checker, Course, Schedule, Supervisor } from '../../core/interfaces/schedule';
import { ScheduleService } from '../admin/service/schedules.service';
import { ClassroomService } from '../classroom-management/service/classroom-service.service';
import { AttendanceService } from '../admin/service/attendance.service';
import { Attendance } from '../../core/interfaces/attendance';
import { UserService } from '../admin/service/user.service';
import { Role, User, UserResponse } from '../../core/interfaces/user';
import { ResponseDto } from '../../core/interfaces/responses';

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
  selectedGroup: number = 0;
  selectedDate: string = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
  currentChecker: User = {
    id: 0,
    username: '',
    email: '',
    name: '',
    role: {} as Role,
    password: '',
  };
  currentUserRole: string = ""; // Obtener el rol del usuario actual
  currentSupervisor: number = 0;
  groupSchedules: Schedule[] = [];
  groups: Classroom[] = [];
  supervisors: Supervisor[] = [
    { id: 1,
      name: "Supervisor 1",
      username: "212312-2",
      email: "correo@gmail.com",
      password: "pass",
      roleName: "supervisor" },
  ];
  professorsList: Professor[] = [];
  // Datos para mostrar en asistencias
  selectedGroupName: string = '';
  selectedGroupClassroom: string = '';
  // Datos de asistencia
  attendanceList: boolean[] = [];
  // Datos para temarios
  selectedProfessor: string = '';
  selectedCourse: string = '';
  selectedPeriod: string = 'current';
  courseSessions: any[] = [];
  selectedSession: any = null;

  // Alerta
  showAlert: boolean = false;
  alertType: 'success' | 'error' = 'success';
  alertTitle: string = '';
  alertMessage: string = '';
  constructor(private schedulesService: ScheduleService,
    private courseService: ClassroomService,
    private attendanceService: AttendanceService,
    private userService: UserService) { }

  ngOnInit(): void {
    // Cargar datos iniciales
    this.loadGroupSchedule();
  }

  // Métodos para la pestaña de Asistencias
  loadGroupSchedule(): void {
    this.userService.getUserByUserName(this.userService.getUserName()).subscribe({
      next: (response) => {
        this.currentChecker = response;
      },
      error: (error) => {
        console.error('Error al obtener el supervisor:', error);
        this.showErrorAlert(
          'Error al registrar asistencia',
          'No se pudo obtener el supervisor. Por favor intente nuevamente.'
        );
      }
    });
    this.currentUserRole = this.userService.getUserRole();
    this.loadProfessorCourses();
    if (!this.selectedGroup) {
      this.groupSchedules = [];
      this.selectedGroupName = '';
      this.selectedGroupClassroom = '';
      return;
    }
    this.groupSchedules = [];
    this.selectedGroupName = '';
    this.selectedGroupClassroom = '';
    this.attendanceList = [];
    this.schedulesService.getSchedulesByCourse(this.selectedGroup).subscribe({
      next: (response) => {
        this.groupSchedules = response;
        console.log('Horarios del grupo:', this.groupSchedules);
        this.groupSchedules.forEach(schedule => {
          this.checkAttendanceToday(schedule);
        })
        console.log(this.attendanceList);
      }
    })
    // Encontrar el grupo seleccionado
    //Esta mamada no estaba funcionando pq el id del numero estaba como "id?" xDD convirtiendo el id a number ya jala 🙉
    const group = this.groups.find(group => group.id === Number(this.selectedGroup));
    if (group) {
      this.selectedGroupName = group.name;
      this.selectedGroupClassroom = group.classroom;
      console.log("Founded Group", group);
    }
  }

  confirmAttendance(scheduleId: number, present: boolean): void {
    const schedule = this.groupSchedules.find(schedule => schedule.id === scheduleId);

    if (!schedule) {
      console.error('Schedule not found for the given ID.');
      this.showErrorAlert(
        'Error al registrar asistencia',
        'No se encontró el horario correspondiente. Por favor intente nuevamente.'
      );
      return;
    }
    const attendance: Attendance = {
      professor: schedule.professor,
      course: schedule.course,
      date: this.selectedDate,
      checkInTime: schedule.startTime,
      checkOutTime: schedule.endTime,
      weeklyTopic: "",
      present: present,
      checker: this.currentChecker,
      checker_type: this.currentUserRole,
    };
    console.log(attendance);
    console.log('Asistencia:', attendance);
    this.attendanceService.createAttendance(attendance).subscribe({
      next: (response) => {
        console.log('Asistencia registrada:', response);
        this.showSuccessAlert(
          'Asistencia registrada',
          `La asistencia ha sido registrada correctamente.`
        );
        // Update attendanceList immediately
        const scheduleIndex = this.groupSchedules.findIndex(s => s.id === scheduleId);
        if (scheduleIndex !== -1) {
          this.attendanceList[scheduleIndex] = true; // Or your logic to mark it as registered
        }
      },
      error: (error) => {
        console.error('Error al registrar asistencia:', error);
        this.showErrorAlert(
          'Error al registrar asistencia',
          `No se pudo registrar la asistencia. Por favor intente nuevamente.`
        );
      }
    });
    /*
    this.showSuccessAlert(
      'Registro exitoso',
      `Se ha registrado la ${status} del profesor ${schedule.professor} para la clase de ${schedule.subject} a las ${schedule.time} por ${supervisor}.`
    );
  */
    // En una aplicación real, aquí enviarías los datos al servidor
  }

  // Métodos para la pestaña de Programar Temarios
  loadProfessorCourses(): void {
    // En una aplicación real, aquí cargarías los datos del servidor
    if (!this.selectedProfessor) {
      this.courseService.getAllCourse().subscribe({
        next: (response) => {
          console.log('Cursos del profesor:', this.groups);
          this.groups = response;
          this.selectedCourse = '';
          this.courseSessions = [];
          this.selectedSession = null;
        },
        error: (error) => {
          console.error('Error al cargar los cursos:', error);
          this.groups = [];
        }
      })
      return;
    }
  }
  public checkAttendanceToday(schedule: Schedule): void {

    this.attendanceService.attendanceToday(schedule.professor.id, schedule.course.id).subscribe({
      next: (res) => {
        this.attendanceList.push(res.response);
      }, error: (error) => {
        console.error('Error al cargar los cursos:', error);
      }
    })
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