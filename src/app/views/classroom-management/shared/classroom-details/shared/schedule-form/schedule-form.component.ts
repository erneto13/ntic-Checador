import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course, Professor, Schedule } from '../../../../../../core/interfaces/schedule';
import { ScheduleService } from '../../../../../admin/service/schedules.service';
import { ClassroomService } from '../../../../service/classroom-service.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LocalTime } from '../../../../../../core/interfaces/classroom';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './schedule-form.component.html',
})
export class ScheduleFormComponent {
  @Output() scheduleCreated = new EventEmitter<void>();
  scheduleForm: FormGroup;
  courses: Course[] = [];
  professors: Professor[] = [];
  scheduleId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private courseService: ClassroomService,
    private professorService: ClassroomService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.scheduleForm = this.fb.group({
      course: [null, Validators.required],
      professor: [null, Validators.required],
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadProfessors();

    this.scheduleId = this.route.snapshot.params['id'];
    if (this.scheduleId) {
      this.loadSchedule(this.scheduleId);
    }
  }

  loadCourses(): void {
    this.courseService.getAllCourse().subscribe(
      courses => this.courses = courses,
      error => console.error('Error loading courses', error)
    );
  }

  loadProfessors(): void {
    this.professorService.getAllProfessors().subscribe(
      professors => this.professors = professors,
      error => console.error('Error loading professors', error)
    );
  }

  loadSchedule(id: number): void {
    this.scheduleService.getScheduleById(id).subscribe(
      schedule => {
        this.scheduleForm.patchValue({
          course: schedule.course,
          professor: schedule.professor,
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime       
        });
      },
      error => console.error('Error loading schedule', error)
    );
  }

  onSubmit(): void {
    if (this.scheduleForm.valid) {
      const formValue = this.scheduleForm.value;
      const scheduleData: Schedule = {
        ...formValue,
        startTime: formValue.startTime, 
        endTime: formValue.endTime 
      };

      if (this.scheduleId) {
        this.scheduleService.updateSchedule(this.scheduleId, scheduleData).subscribe(
          () => this.router.navigate(['/schedules']),
          error => console.error('Error updating schedule', error)
        );
      } else {
        this.scheduleService.createSchedule(scheduleData).subscribe(
          () =>
            this.router.navigate(['/schedules']

            ),
          error => console.error('Error creating schedule', error)
        );
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/schedules']);
  }

  // Helper methods for time conversion
  private formatTimeForInput(time: LocalTime | string): string {
    if (typeof time === 'string') {
      return time;
    }
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  }

  private parseTimeString(timeString: string): LocalTime {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hour: hours, minute: minutes };
  }
}
