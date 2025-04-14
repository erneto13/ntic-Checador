import { Component, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-searchbar.component.html',
})
export class UserSearchbarComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  @Output() search = new EventEmitter<string>();

  private searchSubject = new Subject<string>();
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.search.emit(term);
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
