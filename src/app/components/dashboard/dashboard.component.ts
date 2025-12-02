import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendaService } from '../../services/venda.service';
import { ClienteService } from '../../services/cliente.service';
import { Venda } from '../../models/venda.model';
import { Cliente } from '../../models/cliente.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard de Vendas</h1>
          <p class="dashboard-subtitle">Bem-vindo de volta, aqui está um resumo das suas vendas.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="exportarDados()">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M3 15V17H17V15H3ZM11 3V12.17L14.59 8.59L16 10L10 16L4 10L5.41 8.59L9 12.17V3H11Z" fill="currentColor"/>
            </svg>
            Exportar
          </button>
          <button class="btn btn-primary" (click)="novaVenda()">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 3V17M3 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Nova Venda
          </button>
        </div>
      </div>

      <!-- Filtros de Data -->
      <div class="date-filters">
        <button 
          *ngFor="let filter of dateFilters" 
          [class.active]="selectedFilter === filter.id"
          (click)="selecionarFiltro(filter.id)"
          class="filter-btn">
          {{ filter.label }}
        </button>
      </div>

      <!-- Cards de Métricas -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Vendas Totais</span>
            <div class="metric-change positive">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M5 12L10 7L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>+{{ variacaoVendas }}%</span>
            </div>
          </div>
          <div class="metric-value">R$ {{ formatarValor(estatisticas.valorTotal || 0) }}</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Total de Pedidos</span>
            <div class="metric-change positive">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M5 12L10 7L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>+{{ variacaoPedidos }}%</span>
            </div>
          </div>
          <div class="metric-value">{{ estatisticas.totalVendas || 0 }}</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Ticket Médio</span>
            <div class="metric-change" [class.negative]="variacaoTicket < 0">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" [attr.transform]="variacaoTicket < 0 ? 'rotate(180 10 10)' : ''">
                <path d="M5 12L10 7L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ variacaoTicket > 0 ? '+' : '' }}{{ variacaoTicket }}%</span>
            </div>
          </div>
          <div class="metric-value">R$ {{ formatarValor(ticketMedio) }}</div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">Novos Clientes</span>
            <div class="metric-change positive">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M5 12L10 7L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>+{{ variacaoClientes }}%</span>
            </div>
          </div>
          <div class="metric-value">{{ estatisticas.totalClientes || 0 }}</div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid">
        <div class="chart-card">
          <h3 class="chart-title">Desempenho de Vendas</h3>
          <canvas #vendasChart></canvas>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">Status das Vendas</h3>
          <canvas #statusChart></canvas>
        </div>
      </div>

      <!-- Tabelas -->
      <div class="tables-grid">
        <div class="table-card">
          <h3 class="table-title">Últimas Vendas</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let venda of ultimasVendas">
                  <td>{{ venda.cliente?.nome || 'N/A' }}</td>
                  <td>R$ {{ formatarValor(venda.valor || 0) }}</td>
                  <td>
                    <span class="status-badge" [class.pago]="venda.pagoCompleto" [class.pendente]="!venda.pagoCompleto">
                      {{ venda.pagoCompleto ? 'Pago' : 'Pendente' }}
                    </span>
                  </td>
                  <td>{{ formatarData(venda.dataVenda) }}</td>
                </tr>
                <tr *ngIf="ultimasVendas.length === 0">
                  <td colspan="4" class="empty-state">Nenhuma venda encontrada</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-card">
          <h3 class="table-title">Top Clientes</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Total de Vendas</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cliente of topClientes">
                  <td>{{ cliente.nome }}</td>
                  <td>{{ cliente.totalVendas }}</td>
                  <td>R$ {{ formatarValor(cliente.valorTotal) }}</td>
                </tr>
                <tr *ngIf="topClientes.length === 0">
                  <td colspan="3" class="empty-state">Nenhum cliente encontrado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-spinner">Carregando dados...</div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 32px;
      min-height: 100vh;
      background-color: #f5f5f5;
      position: relative;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .dashboard-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .dashboard-subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #1e3a8a;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1e40af;
    }

    .btn-secondary {
      background-color: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background-color: #f9fafb;
    }

    .date-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
      color: #374151;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background-color: #f9fafb;
    }

    .filter-btn.active {
      background-color: #1e3a8a;
      color: white;
      border-color: #1e3a8a;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .metric-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }

    .metric-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #10b981;
    }

    .metric-change.negative {
      color: #ef4444;
    }

    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .chart-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 20px 0;
    }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .table-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 20px 0;
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      text-align: left;
      padding: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      border-bottom: 1px solid #e5e7eb;
    }

    .data-table td {
      padding: 12px;
      font-size: 14px;
      color: #111827;
      border-bottom: 1px solid #f3f4f6;
    }

    .data-table tr:hover {
      background-color: #f9fafb;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.pago {
      background-color: #d1fae5;
      color: #065f46;
    }

    .status-badge.pendente {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .empty-state {
      text-align: center;
      color: #9ca3af;
      padding: 24px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-spinner {
      font-size: 16px;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 16px;
      }

      .charts-grid,
      .tables-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('vendasChart') vendasChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

  estatisticas: any = {};
  vendas: Venda[] = [];
  clientes: Cliente[] = [];
  ultimasVendas: Venda[] = [];
  topClientes: any[] = [];
  loading = true;

  selectedFilter = 'hoje';
  dateFilters = [
    { id: 'hoje', label: 'Hoje' },
    { id: '7dias', label: 'Últimos 7 dias' },
    { id: 'mes', label: 'Este Mês' },
    { id: 'personalizado', label: 'Personalizado' }
  ];

  variacaoVendas = 12.5;
  variacaoPedidos = 8.2;
  variacaoTicket = -1.5;
  variacaoClientes = 20;

  private vendasChart: Chart | null = null;
  private statusChart: Chart | null = null;

  constructor(
    private vendaService: VendaService,
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  ngAfterViewInit(): void {
    // Os gráficos serão criados após os dados serem carregados
  }

  ngOnDestroy(): void {
    if (this.vendasChart) {
      this.vendasChart.destroy();
    }
    if (this.statusChart) {
      this.statusChart.destroy();
    }
  }

  carregarDados(): void {
    this.loading = true;

    this.vendaService.getEstatisticasVendas().subscribe({
      next: (estatisticas) => {
        this.estatisticas = estatisticas;
        this.carregarVendas();
      },
      error: () => {
        this.carregarVendas();
      }
    });
  }

  carregarVendas(): void {
    this.vendaService.getVendas().subscribe({
      next: (vendas) => {
        this.vendas = vendas;
        this.ultimasVendas = vendas
          .sort((a, b) => new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime())
          .slice(0, 5);

        this.clienteService.getClientes().subscribe({
          next: (clientes) => {
            this.clientes = clientes;
            this.calcularTopClientes();
            this.criarGraficos();
            this.loading = false;
          },
          error: () => {
            this.criarGraficos();
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calcularTopClientes(): void {
    const clienteMap = new Map<number, { nome: string; totalVendas: number; valorTotal: number }>();

    this.vendas.forEach(venda => {
      if (venda.clienteId) {
        const cliente = this.clientes.find(c => c.id === venda.clienteId);
        const nome = cliente?.nome || 'Cliente Desconhecido';
        
        if (!clienteMap.has(venda.clienteId)) {
          clienteMap.set(venda.clienteId, { nome, totalVendas: 0, valorTotal: 0 });
        }
        
        const dados = clienteMap.get(venda.clienteId)!;
        dados.totalVendas++;
        dados.valorTotal += venda.valor || 0;
      }
    });

    this.topClientes = Array.from(clienteMap.values())
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 5);
  }

  criarGraficos(): void {
    // Gráfico de linha - Vendas ao longo do tempo
    if (this.vendasChartRef) {
      const ctx = this.vendasChartRef.nativeElement.getContext('2d');
      if (ctx) {
        const ultimos7Dias = this.obterVendasUltimos7Dias();
        
        if (this.vendasChart) {
          this.vendasChart.destroy();
        }

        this.vendasChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ultimos7Dias.labels,
            datasets: [{
              label: 'Vendas (R$)',
              data: ultimos7Dias.valores,
              borderColor: '#1e3a8a',
              backgroundColor: 'rgba(30, 58, 138, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return 'R$ ' + value.toLocaleString('pt-BR');
                  }
                }
              }
            }
          }
        });
      }
    }

    // Gráfico de pizza - Status das vendas
    if (this.statusChartRef) {
      const ctx = this.statusChartRef.nativeElement.getContext('2d');
      if (ctx) {
        const vendasPagas = this.vendas.filter(v => v.pagoCompleto).length;
        const vendasPendentes = this.vendas.filter(v => !v.pagoCompleto).length;
        
        if (this.statusChart) {
          this.statusChart.destroy();
        }

        this.statusChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Pago', 'Pendente'],
            datasets: [{
              data: [vendasPagas, vendasPendentes],
              backgroundColor: ['#10b981', '#ef4444'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
    }
  }

  obterVendasUltimos7Dias(): { labels: string[], valores: number[] } {
    const hoje = new Date();
    const dias: { [key: string]: number } = {};
    const labels: string[] = [];
    const valores: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' });
      labels.push(diaSemana);
      dias[diaSemana] = 0;
    }

    this.vendas.forEach(venda => {
      const dataVenda = new Date(venda.dataVenda);
      const diffDias = Math.floor((hoje.getTime() - dataVenda.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDias >= 0 && diffDias <= 6) {
        const diaSemana = dataVenda.toLocaleDateString('pt-BR', { weekday: 'short' });
        if (dias[diaSemana] !== undefined) {
          dias[diaSemana] += venda.valor || 0;
        }
      }
    });

    labels.forEach(label => {
      valores.push(dias[label] || 0);
    });

    return { labels, valores };
  }

  selecionarFiltro(filtro: string): void {
    this.selectedFilter = filtro;
    // Aqui você pode implementar a lógica de filtro
  }

  formatarValor(valor: number): string {
    return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  formatarData(data: Date | string): string {
    if (!data) return 'N/A';
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR');
  }

  get ticketMedio(): number {
    if (this.estatisticas.totalVendas && this.estatisticas.totalVendas > 0) {
      return this.estatisticas.valorTotal / this.estatisticas.totalVendas;
    }
    return 0;
  }

  novaVenda(): void {
    this.router.navigate(['/vendas']);
  }

  exportarDados(): void {
    // Implementar exportação de dados
    console.log('Exportar dados');
  }
}
