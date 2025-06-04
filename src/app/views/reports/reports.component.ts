import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more';
import HC_heatmap from 'highcharts/modules/heatmap';
import HC_gantt from 'highcharts/modules/gantt';
import { ClassSession } from '../../core/interfaces/groups';
import { ClassSessionService } from '../class-session/services/class-session.service';
import { CommonModule } from '@angular/common';

// Inicializar módulos de Highcharts


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
})
export default class ReportsComponent {
  classSessions!: ClassSession[]
  loading = true;
  error: string | null = null;

  constructor(private classSession: ClassSessionService) { }

  ngOnInit() {
    this.loadClassSessions();
  }

  loadClassSessions(): void {
    this.classSession.getAllClassSession().subscribe({
      next: (data: ClassSession[]) => {
        this.classSessions = data;
        this.loading = false;
        // Una vez que se cargan las sesiones, se pueden crear los gráficos
        setTimeout(() => {
          this.createDayDistributionChart();
          this.createTimeDistributionChart();
          this.createClassroomUtilizationChart();
          this.createProfessorWorkloadChart();
          this.createSubjectDistributionChart();
          this.createWeeklyHeatmapChart();
          this.createTimelineChart('MONDAY');
        }, 200);
      },
      error: (error) => {
        console.error('Error al cargar las sesiones de clase:', error);
        this.loading = false;
        this.error = 'Error al cargar los datos';
      }
    });
  }

  // 1. Distribución por Día de la Semana
  private createDayDistributionChart() {
    const dayCount = this.getDayDistribution();

    Highcharts.chart('dayDistributionChart', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Número de Sesiones por Día'
      },
      xAxis: {
        categories: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        title: {
          text: 'Día de la Semana'
        }
      },
      yAxis: {
        title: {
          text: 'Número de Sesiones'
        },
        min: 0
      },
      series: [{
        name: 'Sesiones',
        data: dayCount,
        colorByPoint: true,
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
      }],
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true
          }
        }
      }
    } as any);
  }

  // 2. Distribución por Franjas Horarias
  private createTimeDistributionChart() {
    const timeSlots = this.getTimeSlotDistribution();

    Highcharts.chart('timeDistributionChart', {
      chart: {
        type: 'area'
      },
      title: {
        text: 'Distribución de Clases por Franja Horaria'
      },
      xAxis: {
        categories: timeSlots.map(slot => slot.time),
        title: {
          text: 'Hora del Día'
        }
      },
      yAxis: {
        title: {
          text: 'Número de Clases'
        },
        min: 0
      },
      series: [{
        name: 'Clases Activas',
        data: timeSlots.map(slot => slot.count),
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, '#007bff'],
            [1, 'rgba(0, 123, 255, 0.1)']
          ]
        },
        color: '#007bff'
      }],
      plotOptions: {
        area: {
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 2,
            states: {
              hover: {
                enabled: true
              }
            }
          }
        }
      }
    } as any);
  }

  // 3. Utilización de Aulas
  private createClassroomUtilizationChart() {
    const classroomData = this.getClassroomUtilization();

    Highcharts.chart('classroomUtilizationChart', {
      chart: {
        type: 'bar'
      },
      title: {
        text: 'Utilización de Aulas'
      },
      xAxis: {
        categories: classroomData.map(item => item.classroom),
        title: {
          text: 'Aulas'
        }
      },
      yAxis: {
        title: {
          text: 'Horas de Uso Semanal'
        },
        min: 0
      },
      series: [{
        name: 'Horas de Uso',
        data: classroomData.map(item => ({
          y: item.hours,
          color: item.hours > 20 ? '#FF6B6B' : item.hours > 10 ? '#FFEAA7' : '#96CEB4'
        }))
      }],
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            format: '{y}h'
          }
        }
      }
    } as any);
  }

  // 4. Carga de Trabajo por Profesor
  private createProfessorWorkloadChart() {
    const professorData = this.getProfessorWorkload();

    Highcharts.chart('professorWorkloadChart', {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Distribución de Horas por Profesor'
      },
      series: [{
        name: 'Horas de Clase',
        data: professorData.map(item => ({
          name: item.professor,
          y: item.hours,
          color: this.getRandomColor()
        }))
      }],
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}% ({point.y}h)'
          },
          showInLegend: true
        }
      }
    } as any);
  }

  // 5. Distribución de Materias
  private createSubjectDistributionChart() {
    const subjectData = this.getSubjectDistribution();

    Highcharts.chart('subjectDistributionChart', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Distribución de Sesiones por Materia'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br/>Sesiones: <b>{point.y}</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%'
          }
        }
      },
      series: [{
        name: 'Materias',
        colorByPoint: true,
        data: subjectData.map(item => ({
          name: item.subject,
          y: item.sessions
        }))
      }]
    } as any);
  }

  // 6. Heatmap Semanal
  private createWeeklyHeatmapChart() {
    const heatmapData = this.getWeeklyHeatmapData();

    Highcharts.chart('weeklyHeatmapChart', {
      chart: {
        type: 'heatmap',
        marginTop: 40,
        marginBottom: 80,
        plotBorderWidth: 1
      },
      title: {
        text: 'Ocupación Semanal por Hora y Día'
      },
      xAxis: {
        categories: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      },
      yAxis: {
        categories: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        title: null,
        reversed: true
      },
      colorAxis: {
        min: 0,
        minColor: '#FFFFFF',
        maxColor: '#FF6B6B'
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 25,
        symbolHeight: 280
      },
      tooltip: {

      },
      series: [{
        name: 'Clases por hora',
        borderWidth: 1,
        data: heatmapData,
        dataLabels: {
          enabled: true,
          color: '#000000'
        }
      }]
    } as any);
  }

  // 7. Timeline de Actividades Diarias
  private createTimelineChart(selectedDay: string) {
    const timelineData = this.getTimelineData(selectedDay);

    Highcharts.chart('timelineChart', {
      chart: {
        type: 'timeline'
      },
      title: {
        text: `Cronograma de Clases - ${this.getDayName(selectedDay)}`
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        gridLineWidth: 1,
        title: null,
        labels: {
          enabled: false
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        dataLabels: {
          allowOverlap: false,
          format: '<span style="color:{point.color}">● </span><span style="font-weight: bold;" > ' +
            '{point.x:%H:%M}</span><br/>{point.label}'
        },
        marker: {
          symbol: 'circle'
        },
        data: timelineData
      }]
    } as any);
  }

  // Métodos auxiliares para procesar datos - CORREGIDOS
  private getDayDistribution(): number[] {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days.map(day =>
      this.classSessions.filter(session => session.dayOfWeek === day).length
    );
  }

  private getTimeSlotDistribution() {
    const timeSlots: { time: string; count: number }[] = [];
    const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8:00 a 17:00

    hours.forEach(hour => {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const count = this.classSessions.filter(session => {
        // Verificar que startTime y endTime no sean undefined
        if (!session.startTime || !session.endTime) return false;

        const startHour = parseInt(session.startTime.split(':')[0]);
        const endHour = parseInt(session.endTime.split(':')[0]);
        return hour >= startHour && hour < endHour;
      }).length;

      timeSlots.push({ time: timeStr, count });
    });

    return timeSlots;
  }

  private getClassroomUtilization() {
    const classroomMap = new Map<string, number>();

    this.classSessions.forEach(session => {
      // Verificar que classRoom, startTime y endTime no sean undefined
      if (!session.classRoom?.name || !session.startTime || !session.endTime) return;

      const classroom = session.classRoom.name;
      const duration = this.calculateDuration(session.startTime, session.endTime);

      if (classroomMap.has(classroom)) {
        classroomMap.set(classroom, classroomMap.get(classroom)! + duration);
      } else {
        classroomMap.set(classroom, duration);
      }
    });

    return Array.from(classroomMap.entries()).map(([classroom, hours]) => ({
      classroom,
      hours
    }));
  }

  private getProfessorWorkload() {
    const professorMap = new Map<string, number>();

    this.classSessions.forEach(session => {
      // Verificar que startTime y endTime no sean undefined
      if (!session.startTime || !session.endTime) return;

      const professor = session.professor?.name || 'Sin profesor';
      const duration = this.calculateDuration(session.startTime, session.endTime);

      if (professorMap.has(professor)) {
        professorMap.set(professor, professorMap.get(professor)! + duration);
      } else {
        professorMap.set(professor, duration);
      }
    });

    return Array.from(professorMap.entries()).map(([professor, hours]) => ({
      professor,
      hours
    }));
  }

  private getSubjectDistribution() {
    const subjectMap = new Map<string, number>();

    this.classSessions.forEach(session => {
      const subject = session.subject?.name || 'Sin materia';

      if (subjectMap.has(subject)) {
        subjectMap.set(subject, subjectMap.get(subject)! + 1);
      } else {
        subjectMap.set(subject, 1);
      }
    });

    return Array.from(subjectMap.entries()).map(([subject, sessions]) => ({
      subject,
      sessions
    }));
  }

  private getWeeklyHeatmapData() {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const hours = Array.from({ length: 10 }, (_, i) => i + 8);
    const data: [number, number, number][] = [];

    days.forEach((day, dayIndex) => {
      hours.forEach((hour, hourIndex) => {
        const count = this.classSessions.filter(session => {
          if (session.dayOfWeek !== day || !session.startTime || !session.endTime) return false;
          const startHour = parseInt(session.startTime.split(':')[0]);
          const endHour = parseInt(session.endTime.split(':')[0]);
          return hour >= startHour && hour < endHour;
        }).length;

        data.push([dayIndex, hourIndex, count]);
      });
    });

    return data;
  }

  private getTimelineData(selectedDay: string) {
    const daySessions = this.classSessions.filter(session =>
      session.dayOfWeek === selectedDay && session.startTime
    );

    return daySessions.map(session => {
      const startTime = new Date(`2024-01-01T${session.startTime}:00`);
      return {
        x: startTime.getTime(),
        label: `${session.subject?.name || 'Sin materia'}<br/>${session.professor?.name || 'Sin profesor'}<br/>${session.classRoom?.name || 'Sin aula'}`,
        description: `${session.startTime} - ${session.endTime}`
      };
    });
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60; // Retorna horas
  }

  private getDayName(day: string): string {
    const dayNames: { [key: string]: string } = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado'
    };
    return dayNames[day] || day;
  }

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB74D', '#81C784'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Método para actualizar el timeline cuando se cambia el día
  updateTimeline(event: any) {
    const selectedDay = event.target.value;
    this.createTimelineChart(selectedDay);
  }
}
