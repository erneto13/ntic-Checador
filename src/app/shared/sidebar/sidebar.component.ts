import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/service/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {

  currentUser!: string;
  currentRole!: string;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {

    this.currentRole = this.authService.getRoleFromToken() || '';

    const token = this.authService.getAccessToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUser = decoded.userId || decoded.sub;
    }
  }
}
