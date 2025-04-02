import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, ToastService } from '../../core/services/toast.service';

interface ToastItem extends ToastMessage {
  id: string;
  exiting: boolean;
  progress: number;
  timeoutId?: ReturnType<typeof setTimeout>;
  intervalId?: ReturnType<typeof setInterval>;
  createdAt: number;
}

@Component({
  standalone: true,
  selector: 'app-toast',
  imports: [CommonModule],
  styles: [`
    .toast-container {
      position: fixed;
      z-index: 9999;
      top: 80px;
      right: 20px;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    .toast-item {
      width: 300px;
      pointer-events: auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transform: translateX(0);
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .toast-content {
      padding: 12px 16px;
      position: relative;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .toast-progress-bar {
      height: 100%;
      transition: width linear;
    }

    .toast-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }

    .toast-icon {
      margin-right: 10px;
      font-size: 16px;
    }

    .toast-title {
      font-weight: 500;
      font-size: 14px;
      flex-grow: 1;
    }

    .toast-message {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
      font-size: 14px;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: #333;
    }

    .toast-enter {
      transform: translateX(100%);
      opacity: 0;
    }

    .toast-enter-active {
      transform: translateX(0);
      opacity: 1;
    }

    .toast-exit {
      transform: translateX(0);
      opacity: 1;
    }

    .toast-exit-active {
      transform: translateX(100%);
      opacity: 0;
    }
  `],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
        <div 
          class="toast-item"
          [class.toast-enter-active]="!toast.exiting"
          [class.toast-exit-active]="toast.exiting"
          [style.border-left]="'4px solid ' + getToastColor(toast.type)"
        >
          <div class="toast-content">
            <div class="toast-header">
              <i [class]="'toast-icon ' + getIconClass(toast.type)" [style.color]="getToastColor(toast.type)"></i>
              <span class="toast-title">{{ toast.title }}</span>
              <button class="toast-close" (click)="dismiss(toast.id)">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <p class="toast-message">{{ toast.message }}</p>
            <div class="toast-progress">
              <div 
                class="toast-progress-bar" 
                [style.background]="getToastColor(toast.type)"
                [style.width]="toast.progress + '%'"
              ></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastComponent implements OnInit {
  toasts: ToastItem[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastService.toast$.subscribe((toast) => {
      const toastId = Math.random().toString(36).substring(2);
      const duration = this.toastService.getDuration();
      const createdAt = Date.now();

      const newToast: ToastItem = {
        ...toast,
        id: toastId,
        exiting: false,
        progress: 100,
        createdAt,
        timeoutId: setTimeout(() => this.dismiss(toastId), duration),
        intervalId: setInterval(() => {
          const toastIndex = this.toasts.findIndex(t => t.id === toastId);
          if (toastIndex !== -1) {
            const elapsed = Date.now() - this.toasts[toastIndex].createdAt;
            const remaining = Math.max(0, duration - elapsed);
            this.toasts[toastIndex].progress = (remaining / duration) * 100;
          }
        }, 50)
      };

      this.toasts.push(newToast);
    });
  }

  dismiss(id: string): void {
    const toastIndex = this.toasts.findIndex(t => t.id === id);
    if (toastIndex === -1) return;

    if (this.toasts[toastIndex].timeoutId) {
      clearTimeout(this.toasts[toastIndex].timeoutId);
    }
    if (this.toasts[toastIndex].intervalId) {
      clearInterval(this.toasts[toastIndex].intervalId);
    }

    this.toasts[toastIndex].exiting = true;

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 300);
  }

  getToastColor(type: 'success' | 'error' | 'info'): string {
    return {
      success: '#10B981',
      error: '#EF4444',
      info: '#3B82F6',
    }[type];
  }

  getIconClass(type: 'success' | 'error' | 'info'): string {
    return {
      success: 'pi pi-check-circle',
      error: 'pi pi-times-circle',
      info: 'pi pi-info-circle',
    }[type];
  }
}