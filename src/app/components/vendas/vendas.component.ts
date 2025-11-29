import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VendaService } from '../../services/venda.service';
import { ClienteService } from '../../services/cliente.service';
import { Venda } from '../../models/venda.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="vendas-container">
      <header class="dashboard-header">
        <h1>JL Modas - Vendas</h1>
        <nav class="nav-menu">
          <a routerLink="/dashboard" class="nav-item">Dashboard</a>
          <a routerLink="/clientes" class="nav-item">Clientes</a>
          <a routerLink="/vendas" class="nav-item active">Vendas</a>
          <button class="btn btn-danger" (click)="logout()">Sair</button>
        </nav>
      </header>

      <div class="container">
        <div class="card">
          <h2>Cadastrar Nova Venda</h2>
          <form (ngSubmit)="salvarVenda()">
            <div class="form-group">
              <label for="clienteId">Cliente:</label>
              <select
                id="clienteId"
                [(ngModel)]="clienteIdSelecionado"
                name="clienteId"
                required
                (change)="onClienteChange($event)"
              >
                <option value="">Selecione um cliente</option>
                <option *ngFor="let cliente of clientes" [value]="cliente.id">
                  {{ cliente.nome }} - {{ cliente.numero }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="valor">Valor da Venda:</label>
              <input
                type="number"
                id="valor"
                [(ngModel)]="vendaForm.valor"
                name="valor"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>
            <div class="form-group">
              <label for="dataVenda">Data da Venda:</label>
              <input
                type="date"
                id="dataVenda"
                [(ngModel)]="dataVendaInput"
                name="dataVenda"
                required
              />
            </div>
            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  [(ngModel)]="vendaForm.pagoCompleto"
                  name="pagoCompleto"
                />
                Venda completamente paga
              </label>
            </div>
            <div *ngIf="!vendaForm.pagoCompleto" class="form-group">
              <label for="valorPago">Valor Pago (parcial):</label>
              <input
                type="number"
                id="valorPago"
                [(ngModel)]="vendaForm.valorPago"
                name="valorPago"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <button type="submit" class="btn btn-primary">
              {{ editandoVendaId ? 'Atualizar' : 'Cadastrar' }} Venda
            </button>
            <button *ngIf="editandoVendaId" type="button" class="btn btn-danger" (click)="cancelarEdicao()">
              Cancelar
            </button>
          </form>
        </div>

        <div class="card">
          <h2>Lista de Vendas</h2>
          <div *ngIf="loading" class="loading">Carregando vendas...</div>
          
          <table *ngIf="!loading" class="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor Total</th>
                <th>Valor Pago</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let venda of vendas">
                <td>{{ venda.cliente?.nome || 'N/A' }}</td>
                <td>R$ {{ formatarValor(venda.valor) }}</td>
                <td>R$ {{ formatarValor(venda.valorPago || 0) }}</td>
                <td>
                  <span [class]="venda.pagoCompleto ? 'badge-success' : 'badge-warning'">
                    {{ venda.pagoCompleto ? 'Pago' : 'Pendente' }}
                  </span>
                </td>
                <td>{{ formatarData(venda.dataVenda) }}</td>
                <td>
                  <button class="btn btn-primary" (click)="editarVenda(venda)" style="margin-right: 5px;">
                    Editar
                  </button>
                  <button class="btn btn-danger" (click)="deletarVenda(venda.id!)" *ngIf="venda.id">
                    Excluir
                  </button>
                </td>
              </tr>
              <tr *ngIf="vendas.length === 0">
                <td colspan="6" style="text-align: center;">Nenhuma venda cadastrada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendas-container {
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

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .badge-success {
      background-color: #28a745;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .badge-warning {
      background-color: #ffc107;
      color: #333;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  `]
})
export class VendasComponent implements OnInit {
  vendas: Venda[] = [];
  clientes: Cliente[] = [];
  vendaForm: Venda = {
    clienteId: 0,
    valor: 0,
    dataVenda: new Date(),
    pagoCompleto: false,
    valorPago: 0
  };
  dataVendaInput: string = new Date().toISOString().split('T')[0];
  editandoVendaId: number | null = null;
  clienteIdSelecionado: string = '';
  loading = false;

  constructor(
    private vendaService: VendaService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarVendas();
    this.carregarClientes();
  }

  onClienteChange(event: any): void {
    const clienteId = event.target.value;
    this.vendaForm.clienteId = clienteId ? parseInt(clienteId) : 0;
  }

  carregarVendas(): void {
    this.loading = true;
    this.vendaService.getVendas().subscribe({
      next: (vendas) => {
        this.vendas = vendas;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar vendas:', err);
        this.loading = false;
      }
    });
  }

  carregarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
      }
    });
  }

  salvarVenda(): void {
    if (!this.vendaForm.clienteId || this.vendaForm.clienteId === 0 || !this.vendaForm.valor || !this.dataVendaInput) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (this.vendaForm.pagoCompleto) {
      this.vendaForm.valorPago = this.vendaForm.valor;
    } else if (!this.vendaForm.valorPago || this.vendaForm.valorPago < 0) {
      this.vendaForm.valorPago = 0;
    }

    this.vendaForm.dataVenda = new Date(this.dataVendaInput);
    this.vendaForm.valorRestante = this.vendaForm.valor - (this.vendaForm.valorPago || 0);

    if (this.editandoVendaId) {
      this.vendaService.atualizarVenda(this.editandoVendaId, this.vendaForm).subscribe({
        next: () => {
          this.carregarVendas();
          this.limparFormulario();
        },
        error: (err) => {
          console.error('Erro ao atualizar venda:', err);
          alert('Erro ao atualizar venda');
        }
      });
    } else {
      this.vendaService.criarVenda(this.vendaForm).subscribe({
        next: () => {
          this.carregarVendas();
          this.limparFormulario();
        },
        error: (err) => {
          console.error('Erro ao criar venda:', err);
          alert('Erro ao criar venda');
        }
      });
    }
  }

  editarVenda(venda: Venda): void {
    this.vendaForm = { ...venda };
    const dataVenda = typeof venda.dataVenda === 'string' ? new Date(venda.dataVenda) : venda.dataVenda;
    this.dataVendaInput = dataVenda.toISOString().split('T')[0];
    this.clienteIdSelecionado = venda.clienteId ? venda.clienteId.toString() : '';
    this.editandoVendaId = venda.id || null;
  }

  cancelarEdicao(): void {
    this.limparFormulario();
  }

  deletarVenda(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      this.vendaService.deletarVenda(id).subscribe({
        next: () => {
          this.carregarVendas();
        },
        error: (err) => {
          console.error('Erro ao deletar venda:', err);
          alert('Erro ao deletar venda');
        }
      });
    }
  }

  limparFormulario(): void {
    this.vendaForm = {
      clienteId: 0,
      valor: 0,
      dataVenda: new Date(),
      pagoCompleto: false,
      valorPago: 0
    };
    this.dataVendaInput = new Date().toISOString().split('T')[0];
    this.clienteIdSelecionado = '';
    this.editandoVendaId = null;
  }

  formatarValor(valor: number): string {
    return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  formatarData(data: Date | string): string {
    const date = typeof data === 'string' ? new Date(data) : data;
    return date.toLocaleDateString('pt-BR');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

