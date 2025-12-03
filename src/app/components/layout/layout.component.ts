import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <img src="assets/JL-logo.png" alt="JL Modas" class="logo-image" />
            <span class="logo-text">JL Modas</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a 
            routerLink="/dashboard" 
            routerLinkActive="active"
            [routerLinkActiveOptions]="exactRouteMatch"
            class="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L9 4V8H17V12H9V16L3 10Z" fill="currentColor"/>
            </svg>
            <span>Dashboard</span>
          </a>
          <a 
            routerLink="/vendas" 
            routerLinkActive="active"
            class="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 2H16L18 6V16C18 17.1 17.1 18 16 18H4C2.9 18 2 17.1 2 16V4C2 2.9 2.9 2 4 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M6 6H14M6 10H14M6 14H10" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span>Vendas</span>
          </a>
          <a 
            routerLink="/clientes" 
            routerLinkActive="active"
            class="nav-item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor"/>
              <path d="M10 12C5.58172 12 2 14.2386 2 17V20H18V17C18 14.2386 14.4183 12 10 12Z" fill="currentColor"/>
            </svg>
            <span>Clientes</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor"/>
                <path d="M10 12C5.58172 12 2 14.2386 2 17V20H18V17C18 14.2386 14.4183 12 10 12Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="user-details">
              <div class="user-name">Admin</div>
              <div class="user-email">admin&#64;jlmodas.com</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" title="Sair">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 17L2 12M2 12L7 7M2 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .sidebar {
      width: 260px;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
      z-index: 100;
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-image {
      width: 48px;
      height: 48px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #DC2626;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      margin-bottom: 4px;
      border-radius: 8px;
      color: #6b7280;
      text-decoration: none;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
    }

    .nav-item:hover {
      background-color: #f3f4f6;
      color: #1e3a8a;
    }

    .nav-item.active {
      background-color: #eff6ff;
      color: #1e3a8a;
    }

    .nav-item svg {
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid #e5e7eb;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 8px;
      background-color: #f9fafb;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #1e3a8a;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 2px;
    }

    .user-email {
      font-size: 12px;
      color: #6b7280;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logout-btn {
      width: 100%;
      padding: 10px;
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background-color: #fee2e2;
      border-color: #fecaca;
      color: #dc2626;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      min-height: 100vh;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
      }

      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent {
  exactRouteMatch = { exact: true };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

