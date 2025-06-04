import { interval } from "rxjs/internal/observable/interval";
import { AttendanceRecord, AttendanceResponse } from "../../../../core/interfaces/attendance";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ClassSession } from "../../../../core/interfaces/groups";
import { Observable, Subscription } from "rxjs";
import { AttendanceService } from "../../services/attendance.service";
import { AuthService } from "../../../../auth/service/auth.service";
import { ToastService } from "../../../../core/services/toast.service";
import { jwtDecode } from "jwt-decode";
import { CommonModule } from "@angular/common";
import { DialogModule } from "primeng/dialog";

@Component({
  standalone: true,
  selector: 'app-attendance-details',
  imports: [CommonModule, DialogModule],
  templateUrl: './attendance-details.component.html',
})

export class AttendanceDetailsComponent implements OnInit {
  @Input() isVisible = false;
  @Input() classSession: ClassSession | null = null;
  @Output() closed = new EventEmitter<void>();

  attendances: AttendanceResponse[] = [];
  isLoading = false;
  hasChanges = false;
  timeStatus = '';

  // determinar quien es el que pone la asistencia
  // y condicionar botones y otros cosos
  currentUserRole: string | null = null;
  currentUserId: number | null = null;

  hasRegisteredToday = false;

  showAttendanceSelection = false;
  selectedAttendanceStatus: boolean | null = null;

  private timeSubscription?: Subscription;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.currentUserRole = this.authService.getRoleFromToken();
    this.loadAttendances();

    const token = this.authService.getAccessToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUserId = decoded.userId || decoded.id;
    }
  }

  private checkIfAlreadyRegisteredToday(): void {
    if (!this.currentUserId || !this.classSession?.id) {
      this.hasRegisteredToday = false;
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const todaysAttendance = this.attendances.find(attendance => {
      const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];
      return attendanceDate === today;
    });

    if (!todaysAttendance) {
      this.hasRegisteredToday = false;
      return;
    }

    switch (this.currentUserRole) {
      case 'PROFESSOR':
        this.hasRegisteredToday = todaysAttendance.professorVerified === true;
        break;
      case 'SUPERVISOR':
        this.hasRegisteredToday = todaysAttendance.checkerVerified === true &&
          todaysAttendance.checkerId === this.currentUserId;
        break;
      case 'STUDENT':
        this.hasRegisteredToday = todaysAttendance.headStudentVerified === true;
        break;
      default:
        this.hasRegisteredToday = false;
    }
  }

  loadAttendances(): void {
    if (!this.classSession?.id) return;

    this.isLoading = true;
    this.attendanceService.getAllAttendances().subscribe({
      next: (attendances: any) => {
        this.attendances = attendances.filter((attendance: any) =>
          attendance.classSessionId === this.classSession?.id ||
          attendance.class_session_id === this.classSession?.id
        );

        this.checkIfAlreadyRegisteredToday();

        this.isLoading = false;

        this.updateTimeStatus();
        if (this.timeSubscription) {
          this.timeSubscription.unsubscribe();
        }
        this.timeSubscription = interval(60000).subscribe(() => this.updateTimeStatus());
      },
      error: (error: any) => {
        console.error('Error loading attendances:', error);
        this.toastService.showToast('Error', 'No se pudieron cargar las asistencias', 'error');
        this.isLoading = false;
      }
    });
  }

  toggleAttendance(attendance: AttendanceResponse): void {
    if (!this.canTakeAttendance()) return;

    attendance.attended = !attendance.attended;
    this.hasChanges = true;
  }

  isCurrentUserAttendance(attendance: AttendanceResponse): boolean {
    if (!this.currentUserId || !this.currentUserRole) return false;

    const today = new Date().toISOString().split('T')[0];
    const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];

    if (attendanceDate !== today) return false;

    switch (this.currentUserRole) {
      case 'PROFESSOR':
        return attendance.professorVerified;
      case 'SUPERVISOR':
        return attendance.checkerVerified && attendance.checkerId === this.currentUserId;
      case 'STUDENT':
        return attendance.headStudentVerified;
      default:
        return false;
    }
  }

  closeModal(): void {
    this.closed.emit();
  }

  /*
  * VALIDATION METHODS
  */

  // Método corregido para validar si es el día correcto de la clase
  private isCorrectDayForClass(): boolean {
    if (!this.classSession?.dayOfWeek) {
      return false; // Si no hay día definido, no es válido
    }

    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

    // Mapear el día de la semana a número
    const dayMap: { [key: string]: number } = {
      'SUNDAY': 0,
      'MONDAY': 1,
      'TUESDAY': 2,
      'WEDNESDAY': 3,
      'THURSDAY': 4,
      'FRIDAY': 5,
      'SATURDAY': 6,
      // También soportar nombres en español si es el caso
      'DOMINGO': 0,
      'LUNES': 1,
      'MARTES': 2,
      'MIERCOLES': 3,
      'MIÉRCOLES': 3,
      'JUEVES': 4,
      'VIERNES': 5,
      'SABADO': 6,
      'SÁBADO': 6
    };

    const sessionDay = dayMap[this.classSession.dayOfWeek.toUpperCase()];

    // Si no se puede mapear el día, asumir que es válido (fallback)
    if (sessionDay === undefined) {
      console.warn(`Día de la semana no reconocido: ${this.classSession.dayOfWeek}`);
      return true;
    }

    return currentDayOfWeek === sessionDay;
  }

  // Método alternativo si quieres permitir cualquier día (para testing o flexibilidad)
  private isValidDateForAttendance(): boolean {
    // Opción 1: Validar que sea el día correcto de la clase
    return this.isCorrectDayForClass();

    // Opción 2: Permitir cualquier día (descomenta esta línea si prefieres esta opción)
    // return true;

    // Opción 3: Solo permitir días laborales (lunes a viernes)
    // const today = new Date();
    // const dayOfWeek = today.getDay();
    // return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  // Añade este método a tu AttendanceDetailsComponent
  verifyAttendance(attendance: AttendanceResponse): void {
    if (!this.currentUserId || !this.currentUserRole) {
      this.toastService.showToast('Error', 'No hay información de usuario', 'error');
      return;
    }

    if (this.hasRegisteredToday) {
      this.toastService.showToast('Advertencia', 'Ya has verificado la asistencia hoy', 'info');
      return;
    }

    if (!attendance.id) {
      this.toastService.showToast('Error', 'ID de asistencia no disponible', 'error');
      return;
    }

    this.isLoading = true;
    let verificationObservable: Observable<AttendanceResponse>;

    switch (this.currentUserRole) {
      case 'PROFESSOR':
        verificationObservable = this.attendanceService.verifyAttendanceByProfessor(attendance.id);
        break;
      case 'STUDENT':
        verificationObservable = this.attendanceService.verifyAttendanceByHeadStudent(attendance.id);
        break;
      case 'SUPERVISOR':
        if (!this.currentUserId) {
          this.toastService.showToast('Error', 'ID de usuario no disponible', 'error');
          this.isLoading = false;
          return;
        }
        verificationObservable = this.attendanceService.verifyAttendanceByChecker(attendance.id, this.currentUserId);
        break;
      default:
        this.toastService.showToast('Error', 'Rol no válido para verificar asistencia', 'error');
        this.isLoading = false;
        return;
    }

    verificationObservable.subscribe({
      next: () => {
        this.toastService.showToast('Éxito', 'Asistencia verificada correctamente', 'success');
        this.loadAttendances();
      },
      error: (error) => {
        console.error('Error al verificar asistencia:', error);
        let mensaje = 'No se pudo verificar la asistencia';

        if (error.status === 409 ||
          error.error?.message?.includes('ya ha verificado')) {
          mensaje = 'Ya has verificado esta asistencia anteriormente';
        }

        this.toastService.showToast('Error', mensaje, 'error');
        this.isLoading = false;
      }
    });
  }

  canVerifyAttendance(attendance: AttendanceResponse): boolean {
    if (!this.currentUserRole || !this.canTakeAttendance()) {
      return false;
    }

    if (this.currentUserRole === 'ADMIN') {
      return false;
    }

    switch (this.currentUserRole) {
      case 'PROFESSOR':
        return !attendance.professorVerified;
      case 'STUDENT':
        return !attendance.headStudentVerified;
      case 'SUPERVISOR':
        return !attendance.checkerVerified;
      default:
        return false;
    }
  }

  isAdminUser(): boolean {
    return this.currentUserRole === 'ADMIN';
  }

  canReloadTable(): boolean {
    return this.currentUserRole === 'ADMIN' || this.hasRegisteredToday;
  }

  selectAttendanceStatus(attended: boolean): void {
    this.selectedAttendanceStatus = attended;
  }

  confirmAttendanceSelection(): void {
    if (this.selectedAttendanceStatus === null) {
      this.toastService.showToast('Advertencia', 'Por favor selecciona si asististe o no', 'info');
      return;
    }

    this.createAttendanceRecord();
    this.cancelAttendanceSelection();
  }

  cancelAttendanceSelection(): void {
    this.showAttendanceSelection = false;
    this.selectedAttendanceStatus = null;
  }

  // MODIFICAR EL MÉTODO createAttendanceRecord para usar la selección
  private createAttendanceRecord(): void {
    const today = new Date().toISOString().split('T')[0];

    if (!this.classSession?.id) {
      this.toastService.showToast('Error', 'ID de sesión no disponible', 'error');
      return;
    }

    if (this.selectedAttendanceStatus === null) {
      this.toastService.showToast('Error', 'Estado de asistencia no seleccionado', 'error');
      return;
    }

    const rawAttendance: AttendanceRecord = {
      classSessionId: this.classSession.id,
      date: today,
      attended: this.selectedAttendanceStatus, // USAR LA SELECCIÓN DEL USUARIO
      professorVerified: this.currentUserRole === 'PROFESSOR',
      professorVerificationTime: this.currentUserRole === 'PROFESSOR' ? new Date().toISOString() : undefined,
      headStudentVerified: this.currentUserRole === 'STUDENT',
      headStudentVerificationTime: this.currentUserRole === 'STUDENT' ? new Date().toISOString() : undefined,
      checkerVerified: this.currentUserRole === 'SUPERVISOR',
      checkerVerificationTime: this.currentUserRole === 'SUPERVISOR' ? new Date().toISOString() : undefined,
      checkerId: this.currentUserRole === 'SUPERVISOR' ? (this.currentUserId ?? undefined) : undefined,
    };

    this.isLoading = true;
    this.attendanceService.createAttendance(rawAttendance).subscribe({
      next: (response: any) => {
        this.loadAttendances();
        const statusText = this.selectedAttendanceStatus ? 'Presente' : 'Ausente';
        this.toastService.showToast('Éxito', `Asistencia registrada como: ${statusText}`, 'success');
      },
      error: (error: any) => {
        console.error('Error creating attendance:', error);

        if (error.status === 409 ||
          error.error?.message?.includes('duplicate') ||
          error.error?.message?.includes('already exists') ||
          error.error?.message?.includes('ya existe')) {
          this.toastService.showToast('Advertencia', 'Ya existe un registro de asistencia para hoy', 'info');
          this.loadAttendances();
        } else {
          this.toastService.showToast('Error', 'No se pudo registrar la asistencia', 'error');
        }

        this.isLoading = false;
      }
    });
  }

  // MÉTODO PARA OBTENER EL TEXTO DEL BOTÓN SEGÚN EL ROL
  getAttendanceButtonText(): string {
    switch (this.currentUserRole) {
      case 'PROFESSOR':
        return 'Registrar Asistencia de Clase';
      case 'SUPERVISOR':
        return 'Registrar Verificación';
      case 'STUDENT':
        return 'Registrar Asistencia de Grupo';
      default:
        return 'Registrar Asistencia';
    }
  }

  canTakeAttendance(): boolean {
    if (!this.classSession?.startTime || !this.classSession?.endTime) {
      return false;
    }

    // VALIDACIÓN CORREGIDA: Verificar que sea el día correcto de la clase
    if (!this.isValidDateForAttendance()) {
      return false;
    }

    if (!this.attendanceService.canTakeAttendance(
      this.classSession.startTime,
      this.classSession.endTime
    )) {
      return false;
    }

    if (!this.currentUserRole) return false;

    if (this.currentUserRole === 'ADMIN') {
      return false;
    }

    if (!['PROFESSOR', 'SUPERVISOR', 'STUDENT'].includes(this.currentUserRole)) {
      return false;
    }

    if (this.hasRegisteredToday) {
      return false;
    }

    return true;
  }

  // Método mejorado para obtener la razón por la cual no se puede registrar
  getCannotRegisterReason(): string {
    if (!this.classSession?.startTime || !this.classSession?.endTime) {
      return 'Horario de asistencia no definido';
    }

    // VALIDACIÓN CORREGIDA: Verificar si es el día correcto de la clase
    if (!this.isValidDateForAttendance()) {
      const dayNames: { [key: string]: string } = {
        'MONDAY': 'Lunes',
        'TUESDAY': 'Martes',
        'WEDNESDAY': 'Miércoles',
        'THURSDAY': 'Jueves',
        'FRIDAY': 'Viernes',
        'SATURDAY': 'Sábado',
        'SUNDAY': 'Domingo'
      };

      const sessionDayName = this.classSession?.dayOfWeek ?
        dayNames[this.classSession.dayOfWeek.toUpperCase()] || this.classSession.dayOfWeek :
        'definido';

      return `Solo se puede registrar asistencia los días ${sessionDayName}`;
    }

    if (!this.attendanceService.canTakeAttendance(
      this.classSession.startTime,
      this.classSession.endTime
    )) {
      return 'Fuera del horario permitido (±15 minutos)';
    }

    if (!this.currentUserRole) {
      return 'No tienes permisos para registrar asistencia';
    }

    if (this.currentUserRole === 'ADMIN') {
      return 'Los administradores solo pueden visualizar las asistencias';
    }

    if (!['PROFESSOR', 'SUPERVISOR', 'STUDENT'].includes(this.currentUserRole)) {
      return 'No tienes permisos para registrar asistencia';
    }

    if (this.hasRegisteredToday) {
      return 'Ya registraste la asistencia hoy';
    }

    return '';
  }

  // Método mejorado para inicializar la asistencia con validación de fecha
  initializeAttendance(): void {
    if (!this.classSession?.id || !this.currentUserId) {
      this.toastService.showToast('Error', 'Información de sesión no válida', 'error');
      return;
    }

    // VALIDACIÓN CORREGIDA: Verificar que sea el día correcto de la clase
    if (!this.isValidDateForAttendance()) {
      const dayNames: { [key: string]: string } = {
        'MONDAY': 'Lunes',
        'TUESDAY': 'Martes',
        'WEDNESDAY': 'Miércoles',
        'THURSDAY': 'Jueves',
        'FRIDAY': 'Viernes',
        'SATURDAY': 'Sábado',
        'SUNDAY': 'Domingo'
      };

      const sessionDayName = this.classSession?.dayOfWeek ?
        dayNames[this.classSession.dayOfWeek.toUpperCase()] || this.classSession.dayOfWeek :
        'definido';

      this.toastService.showToast('Error', `Solo se puede registrar asistencia los días ${sessionDayName}`, 'error');
      return;
    }

    if (!this.classSession.startTime || !this.classSession.endTime) {
      this.toastService.showToast('Error', 'Horario de sesión no definido', 'error');
      return;
    }

    if (!this.attendanceService.canTakeAttendance(
      this.classSession.startTime,
      this.classSession.endTime
    )) {
      this.toastService.showToast('Advertencia', 'Fuera del horario permitido (±15 minutos)', 'info');
      return;
    }

    if (!['PROFESSOR', 'SUPERVISOR', 'STUDENT'].includes(this.currentUserRole || '')) {
      this.toastService.showToast('Error', 'No tienes permisos para registrar asistencia', 'error');
      return;
    }

    this.loadAttendances();

    setTimeout(() => {
      if (this.hasRegisteredToday) {
        this.toastService.showToast('Advertencia', 'Ya registraste la asistencia para esta clase hoy', 'info');
        return;
      }

      this.showAttendanceSelection = true;
      this.selectedAttendanceStatus = null;
    }, 100);
  }

  // Método mejorado para actualizar el estado del tiempo
  private updateTimeStatus(): void {
    if (!this.classSession) return;

    if (!this.classSession.startTime || !this.classSession.endTime) {
      this.timeStatus = 'Horario de asistencia no definido';
      return;
    }

    // VALIDACIÓN CORREGIDA: Verificar si es el día correcto de la clase
    if (!this.isValidDateForAttendance()) {
      const dayNames: { [key: string]: string } = {
        'MONDAY': 'Lunes',
        'TUESDAY': 'Martes',
        'WEDNESDAY': 'Miércoles',
        'THURSDAY': 'Jueves',
        'FRIDAY': 'Viernes',
        'SATURDAY': 'Sábado',
        'SUNDAY': 'Domingo'
      };

      const sessionDayName = this.classSession?.dayOfWeek ?
        dayNames[this.classSession.dayOfWeek.toUpperCase()] || this.classSession.dayOfWeek :
        'definido';

      this.timeStatus = `Solo disponible los días ${sessionDayName}`;
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMinute] = this.classSession.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.classSession.endTime.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const WINDOW_MINUTES = 15;

    if (currentTime < startTime - WINDOW_MINUTES) {
      const minutesUntilStart = (startTime - WINDOW_MINUTES) - currentTime;
      this.timeStatus = `Asistencia disponible en ${minutesUntilStart} minutos`;
    } else if (currentTime >= startTime - WINDOW_MINUTES && currentTime <= endTime + WINDOW_MINUTES) {
      const minutesRemaining = (endTime + WINDOW_MINUTES) - currentTime;
      this.timeStatus = `Asistencia activa - ${minutesRemaining} minutos restantes`;
    } else {
      this.timeStatus = 'Periodo de asistencia cerrado';
    }

    if (this.hasRegisteredToday) {
      this.timeStatus += ' (Ya registrado hoy)';
    }
  }

  // Mejorar el método getTimeStatusClass para incluir validación de día
  getTimeStatusClass(): string {
    if (!this.isValidDateForAttendance()) {
      return 'text-red-300';
    }

    if (this.hasRegisteredToday) {
      return 'text-blue-300';
    }

    if (this.canTakeAttendance()) {
      return 'text-green-300';
    }

    return 'text-yellow-300';
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }
}