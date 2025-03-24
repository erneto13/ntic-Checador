import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation.component.html',
  styleUrl: './aaa.css',
})
export default class EvaluationComponent {
  activeTab: 'questions' | 'pending' | 'statistics' = 'pending';

  // Add Questions Tab Data
  newQuestion: string = '';
  newCategory: string = '';
  questions = [
    { id: '1', text: 'El profesor explica con claridad', category: 'Didáctica' },
    { id: '2', text: 'El profesor responde adecuadamente las dudas', category: 'Comunicación' },
    { id: '3', text: 'El profesor es puntual', category: 'Responsabilidad' }
  ];

  // Pending Evaluations Tab Data
  evaluations = [
    { id: '1', teacherName: 'M.I.A. Jose Miguel', courseName: 'Programacion I', completed: false },
    { id: '2', teacherName: 'Dr. Herman Ayala', courseName: 'Desarrollo Web 1', completed: false },
    { id: '3', teacherName: 'Dr. Manuel Rodríguez', courseName: 'Programación Orientada a Objetos', completed: false },
    { id: '4', teacherName: 'Dr. Yobani Martínez', courseName: 'Teoria de la Computación', completed: true }
  ];

  // Statistics Tab Data
  selectedTeacher: string = 'all';
  selectedDepartment: string = 'all';
  statisticsTab: 'overall' | 'categories' | 'questions' = 'overall';

  // Evaluation Form Data
  showEvaluationForm: boolean = false;
  selectedEvaluation: any = null;

  // Methods (these would have actual functionality in a real app)
  setActiveTab(tab: 'questions' | 'pending' | 'statistics'): void {
    this.activeTab = tab;
    this.showEvaluationForm = false;
  }

  setStatisticsTab(tab: 'overall' | 'categories' | 'questions'): void {
    this.statisticsTab = tab;
  }

  addQuestion(): void {
    if (this.newQuestion && this.newCategory) {
      const newId = (this.questions.length + 1).toString();
      this.questions.push({
        id: newId,
        text: this.newQuestion,
        category: this.newCategory
      });
      this.newQuestion = '';
      this.newCategory = '';
    }
  }

  deleteQuestion(id: string): void {
    this.questions = this.questions.filter(q => q.id !== id);
  }

  startEvaluation(evaluation: any): void {
    this.selectedEvaluation = evaluation;
    this.showEvaluationForm = true;
  }

  submitEvaluation(): void {
    if (this.selectedEvaluation) {
      this.evaluations = this.evaluations.map(item =>
        item.id === this.selectedEvaluation.id ? { ...item, completed: true } : item
      );
      this.showEvaluationForm = false;
    }
  }

}
