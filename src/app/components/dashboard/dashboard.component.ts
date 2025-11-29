import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VendaService } from '../../services/venda.service';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>JL Modas - Dashboard</h1>
        <nav class="nav-menu">
          <a routerLink="/dashboard" class="nav-item active">Dashboard</a>
          <a routerLink="/clientes" class="nav-item">Clientes</a>
          <a routerLink="/vendas" class="nav-item">Vendas</a>
          <button class="btn btn-danger" (click)="logout()">Sair</button>
        </nav>
      </header>

      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total de Vendas</h3>
            <p class="stat-value">{{ estatisticas.totalVendas || 0 }}</p>
          </div>
          <div class="stat-card">
            <h3>Valor Total</h3>
            <p class="stat-value">R$ {{ formatarValor(estatisticas.valorTotal || 0) }}</p>
          </div>
          <div class="stat-card">
            <h3>Vendas Pagas</h3>
            <p class="stat-value">{{ estatisticas.vendasPagas || 0 }}</p>
          </div>
          <div class="stat-card">
            <h3>Valor Pendente</h3>
            <p class="stat-value">R$ {{ formatarValor(estatisticas.valorPendente || 0) }}</p>
          </div>
          <div class="stat-card">
            <h3>Total de Clientes</h3>
            <p class="stat-value">{{ estatisticas.totalClientes || 0 }}</p>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          Carregando dados...
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .dashboard-header {
      background: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      color: #667eea;
      margin-bottom: 15px;
    }

    .nav-menu {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .nav-item {
      padding: 8px 16px;
      text-decoration: none;
      color: #333;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .nav-item:hover,
    .nav-item.active {
      background-color: #667eea;
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-card h3 {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      margin: 0;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  estatisticas: any = {};
  loading = true;

  constructor(
    private authService: AuthService,
    private vendaService: VendaService,
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarEstatisticas();
  }

  carregarEstatisticas(): void {
    this.loading = true;
    
    // Usar o endpoint de estatísticas do backend
    this.vendaService.getEstatisticasVendas().subscribe({
      next: (estatisticas) => {
        this.estatisticas = estatisticas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.loading = false;
        // Fallback: calcular manualmente se o endpoint não estiver disponível
        this.carregarEstatisticasFallback();
      }
    });
  }

  carregarEstatisticasFallback(): void {
    this.vendaService.getVendas().subscribe({
      next: (vendas) => {
        this.clienteService.getClientes().subscribe({
          next: (clientes) => {
            this.estatisticas = {
              totalVendas: vendas.length,
              valorTotal: vendas.reduce((sum, v) => sum + (v.valor || 0), 0),
              vendasPagas: vendas.filter(v => v.pagoCompleto).length,
              valorPendente: vendas
                .filter(v => !v.pagoCompleto)
                .reduce((sum, v) => sum + ((v.valor || 0) - (v.valorPago || 0)), 0),
              totalClientes: clientes.length
            };
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatarValor(valor: number): string {
    return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

