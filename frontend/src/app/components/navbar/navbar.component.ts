import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  onLogout(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.auth.logout(); 
  }
}




