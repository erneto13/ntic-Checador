import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatTime',
    standalone: true
})
export class FormatTimePipe implements PipeTransform {
    transform(time: string): string {
        if (!time) return '--:--';
        return time.slice(0, 5);
    }
}