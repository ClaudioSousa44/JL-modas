import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <div class="login-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="4" fill="#1e3a8a"/>
                <path d="M20 12L25 18H22V26H18V18H15L20 12Z" fill="white"/>
              </svg>
            </div>
          </div>

          <!-- Título -->
          <div class="title-section">
            <h1 class="welcome-title">Bem-vindo(a) de volta</h1>
            <p class="welcome-subtitle">Acesse o Sistema de Gerenciamento da Loja</p>
          </div>

          <!-- Formulário -->
          <form (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group">
              <label for="email">Email / Usuário</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="seuemall@exemplo.com"
                class="form-input"
                [class.error]="error && !email"
              />
            </div>

            <div class="form-group">
              <label for="password">Senha</label>
              <div class="password-wrapper">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  id="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="Digite sua senha"
                  class="form-input"
                  [class.error]="error && !password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="togglePassword()"
                  tabindex="-1"
                >
                  <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3C5 3 1.73 7.11 1 10C1.73 12.89 5 17 10 17C15 17 18.27 12.89 19 10C18.27 7.11 15 3 10 3ZM10 15C7.24 15 5 12.76 5 10C5 7.24 7.24 5 10 5C12.76 5 15 7.24 15 10C15 12.76 12.76 15 10 15ZM10 7C8.34 7 7 8.34 7 10C7 11.66 8.34 13 10 13C11.66 13 13 11.66 13 10C13 8.34 11.66 7 10 7Z" fill="#6B7280"/>
                  </svg>
                  <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M13.875 5.625L10 9.5L6.125 5.625L5 6.75L8.875 10.625L5 14.5L6.125 15.625L10 11.75L13.875 15.625L15 14.5L11.125 10.625L15 6.75L13.875 5.625ZM10 3C5 3 1.73 7.11 1 10C1.73 12.89 5 17 10 17C11.84 17 13.55 16.48 14.99 15.59L13.56 14.15C12.46 14.7 11.26 15 10 15C7.24 15 5 12.76 5 10C5 7.24 7.24 5 10 5C11.26 5 12.46 5.3 13.56 5.85L14.99 4.41C13.55 3.52 11.84 3 10 3Z" fill="#6B7280"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Opções -->
            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
                <span class="checkbox-label">Lembrar-me</span>
              </label>
              <a href="#" class="forgot-password">Esqueceu sua senha?</a>
            </div>

            <!-- Mensagem de erro -->
            <div *ngIf="error" class="error-message">
              {{ error }}
            </div>

            <!-- Botão de submit -->
            <button type="submit" class="submit-button" [disabled]="loading">
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <!-- Footer -->
          <div class="login-footer">
            <p>© 2024 JL Modas. Todos os direitos reservados.</p>
          </div>
        </div>

        <!-- Imagem decorativa -->
        <div class="decorative-image">
          <div class="image-placeholder">
            <!-- Imagem será aplicada via CSS -->
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-container {
      display: flex;
      width: 100%;
      max-width: 1200px;
      min-height: 100vh;
      background: white;
    }

    .login-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 80px;
      max-width: 500px;
    }

    .logo-container {
      margin-bottom: 40px;
    }

    .logo {
      width: 56px;
      height: 56px;
      background: #1e3a8a;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .title-section {
      margin-bottom: 40px;
    }

    .welcome-title {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .welcome-subtitle {
      font-size: 16px;
      color: #6B7280;
      margin: 0;
      line-height: 1.5;
    }

    .login-form {
      width: 100%;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #1e3a8a;
      box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
    }

    .form-input.error {
      border-color: #EF4444;
    }

    .form-input::placeholder {
      color: #9CA3AF;
    }

    .password-wrapper {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .password-toggle:hover {
      opacity: 0.7;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .checkbox-container input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin-right: 8px;
      cursor: pointer;
      accent-color: #1e3a8a;
    }

    .checkbox-label {
      font-size: 14px;
      color: #374151;
      user-select: none;
    }

    .forgot-password {
      font-size: 14px;
      color: #1e3a8a;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .forgot-password:hover {
      color: #1e40af;
      text-decoration: underline;
    }

    .error-message {
      background: #FEE2E2;
      color: #DC2626;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 24px;
      border: 1px solid #FECACA;
    }

    .submit-button {
      width: 100%;
      padding: 14px;
      background: #1e3a8a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .submit-button:hover:not(:disabled) {
      background: #1e40af;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-footer {
      margin-top: 40px;
      text-align: center;
    }

    .login-footer p {
      font-size: 12px;
      color: #9CA3AF;
      margin: 0;
    }

    .decorative-image {
      flex: 1;
      background: linear-gradient(135deg, #E8D5B7 0%, #D4A574 50%, #C9A067 100%);
      position: relative;
      display: none;
      overflow: hidden;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      position: relative;
      background: linear-gradient(to bottom, #E8D5B7 0%, #D4A574 100%);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 40px;
    }

    .image-placeholder::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60%;
      background: 
        linear-gradient(to bottom, transparent 0%, rgba(212, 165, 116, 0.3) 100%),
        repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 190px,
          rgba(212, 165, 116, 0.05) 190px,
          rgba(212, 165, 116, 0.05) 200px
        );
      background-size: 100% 100%, 200px 4px;
    }

    .image-placeholder::after {
      content: '';
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      height: 250px;
      background: linear-gradient(180deg, #F5E6D3 0%, #E8D5B7 100%);
      border-radius: 8px;
      box-shadow: 
        0 10px 30px rgba(0, 0, 0, 0.1),
        inset 0 -20px 40px rgba(201, 160, 103, 0.2);
    }

    @media (min-width: 1024px) {
      .decorative-image {
        display: block;
      }

      .login-wrapper {
        background: white;
      }
    }

    @media (max-width: 768px) {
      .login-content {
        padding: 40px 24px;
        max-width: 100%;
      }

      .welcome-title {
        font-size: 28px;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;
  rememberMe = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Email ou senha incorretos';
        this.loading = false;
        console.error('Erro no login:', err);
      }
    });
  }
}

