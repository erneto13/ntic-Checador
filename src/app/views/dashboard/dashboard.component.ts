import { Component } from '@angular/core';
import { AuthService } from '../../auth/service/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderComponent],
  templateUrl: './dashboard.component.html',
})
export default class DashboardComponent {

  constructor(public auth: AuthService) { }

  logout(): void {
    this.auth.logout();
  }
}
