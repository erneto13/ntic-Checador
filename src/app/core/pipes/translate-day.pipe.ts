import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'translateDay',
    standalone: true
})
export class TranslateDayPipe implements PipeTransform {
    transform(day: string): string {
        const daysMap: Record<string, string> = {
            'MONDAY': 'Lunes',
            'TUESDAY': 'Martes',
            'WEDNESDAY': 'Miércoles',
            'THURSDAY': 'Jueves',
            'FRIDAY': 'Viernes',
            'SATURDAY': 'Sábado',
            'SUNDAY': 'Domingo'
        };
        return daysMap[day] || day;
    }
}