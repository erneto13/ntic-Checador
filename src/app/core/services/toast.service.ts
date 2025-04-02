import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toastSubject = new Subject<ToastMessage>();
    toast$ = this.toastSubject.asObservable();

    private readonly TOAST_DURATION = 3000;

    showToast(title: string, message: string, type: 'success' | 'error' | 'info') {
        this.toastSubject.next({ title, message, type });
    }

    getDuration(): number {
        return this.TOAST_DURATION;
    }
}