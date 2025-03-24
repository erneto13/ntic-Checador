import { Component } from '@angular/core';
import { AuthService } from '../../auth/service/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  constructor(private authService: AuthService) { }
  
  logout() {
    this.authService.logout();
  }
}
