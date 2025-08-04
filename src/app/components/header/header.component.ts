import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isAuthenticated = false;
  currentUser: User | null = null;
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription.add(
      this.authService.isAuthenticated$.subscribe(
        isAuth => this.isAuthenticated = isAuth
      )
    );

    this.authSubscription.add(
      this.authService.currentUser$.subscribe(
        user => this.currentUser = user
      )
    );
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
