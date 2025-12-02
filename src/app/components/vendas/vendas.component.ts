import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendaService } from '../../services/venda.service';
import { ClienteService } from '../../services/cliente.service';
import { Venda } from '../../models/venda.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vendas-container">
      <div class="page-header">
        <div>
          <h1>Vendas</h1>
          <p class="page-subtitle">Gerencie suas vendas</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalNovaVenda()">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M10 3V17M3 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Nova Venda
        </button>
      </div>

      <div class="container">
        <!-- Filtros -->
        <div class="card">
          <h2>Filtros</h2>
          <div class="filters-row">
            <div class="form-group">
              <label for="filtroCliente">Cliente:</label>
              <select
                id="filtroCliente"
                [(ngModel)]="filtroClienteId"
                name="filtroCliente"
                (change)="aplicarFiltros()"
                class="filter-select"
              >
                <option value="">Todos os clientes</option>
                <option *ngFor="let cliente of clientes" [value]="cliente.id">
                  {{ cliente.nome }} - {{ cliente.numero }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="filtroDataInicio">Data Início:</label>
              <input
                type="date"
                id="filtroDataInicio"
                [(ngModel)]="filtroDataInicio"
                name="filtroDataInicio"
                (change)="aplicarFiltros()"
                class="filter-input"
              />
            </div>
            <div class="form-group">
              <label for="filtroDataFim">Data Fim:</label>
              <input
                type="date"
                id="filtroDataFim"
                [(ngModel)]="filtroDataFim"
                name="filtroDataFim"
                (change)="aplicarFiltros()"
                class="filter-input"
              />
            </div>
            <div class="form-group">
              <button class="btn btn-secondary" (click)="limparFiltros()">
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de Vendas -->
        <div class="card">
          <h2>Lista de Vendas</h2>
          <div *ngIf="loading" class="loading">Carregando vendas...</div>
          
          <div *ngIf="!loading" class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Valor Total</th>
                  <th>Valor Pago</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Itens Comprados</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let venda of vendasFiltradas">
                  <td>{{ venda.cliente?.nome || 'N/A' }}</td>
                  <td>R$ {{ formatarValor(venda.valor) }}</td>
                  <td>R$ {{ formatarValor(venda.valorPago || 0) }}</td>
                  <td>
                    <span [class]="venda.pagoCompleto ? 'badge-success' : 'badge-warning'">
                      {{ venda.pagoCompleto ? 'Pago' : 'Pendente' }}
                    </span>
                  </td>
                  <td>{{ formatarData(venda.dataVenda) }}</td>
                  <td class="observacoes-cell">
                    <span *ngIf="venda.observacoes" [title]="venda.observacoes">
                      {{ venda.observacoes.length > 50 ? (venda.observacoes.substring(0, 50) + '...') : venda.observacoes }}
                    </span>
                    <span *ngIf="!venda.observacoes" class="text-muted">-</span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-primary" (click)="editarVenda(venda)">
                      Editar
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="deletarVenda(venda.id!)" *ngIf="venda.id">
                      Excluir
                    </button>
                  </td>
                </tr>
                <tr *ngIf="vendasFiltradas.length === 0">
                  <td colspan="7" class="empty-state">Nenhuma venda encontrada</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal de Nova/Editar Venda -->
      <div *ngIf="mostrarModal" class="modal-overlay" (click)="fecharModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editandoVendaId ? 'Editar Venda' : 'Nova Venda' }}</h2>
            <button class="modal-close" (click)="fecharModal()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
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
                <label class="checkbox-label">
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
              <div class="form-group">
                <label for="observacoes">Itens Comprados / Observações:</label>
                <textarea
                  id="observacoes"
                  [(ngModel)]="vendaForm.observacoes"
                  name="observacoes"
                  rows="4"
                  placeholder="Ex: 2 camisetas, 1 calça jeans, 1 moletom..."
                  class="textarea-field"
                ></textarea>
              </div>
              <div class="modal-actions">
                <button type="submit" class="btn btn-primary">
                  {{ editandoVendaId ? 'Atualizar' : 'Cadastrar' }} Venda
                </button>
                <button type="button" class="btn btn-secondary" (click)="fecharModal()">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendas-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 32px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .container {
      max-width: 1200px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;
    }

    .card h2 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 20px 0;
    }

    .filters-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 16px;
      align-items: end;
    }

    .form-group {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
      font-family: inherit;
      resize: vertical;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #1e3a8a;
      box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
    }

    .textarea-field {
      min-height: 80px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
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

    .btn-danger {
      background-color: #dc2626;
      color: white;
    }

    .btn-danger:hover {
      background-color: #b91c1c;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      margin-right: 4px;
    }

    .table-container {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .table th {
      text-align: left;
      padding: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      border-bottom: 1px solid #e5e7eb;
    }

    .table td {
      padding: 12px;
      font-size: 14px;
      color: #111827;
      border-bottom: 1px solid #f3f4f6;
    }

    .table tr:hover {
      background-color: #f9fafb;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      color: #9ca3af;
      padding: 24px;
    }

    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-warning {
      background-color: #fee2e2;
      color: #991b1b;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .observacoes-cell {
      max-width: 200px;
      word-wrap: break-word;
    }

    .text-muted {
      color: #9ca3af;
      font-style: italic;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .modal-close:hover {
      color: #111827;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-body .form-group {
      margin-bottom: 16px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .filters-row {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
      }

      .modal-content {
        max-width: 100%;
        margin: 0;
      }
    }
  `]
})
export class VendasComponent implements OnInit {
  vendas: Venda[] = [];
  vendasFiltradas: Venda[] = [];
  clientes: Cliente[] = [];
  vendaForm: Venda = {
    clienteId: 0,
    valor: 0,
    dataVenda: new Date(),
    pagoCompleto: false,
    valorPago: 0,
    observacoes: ''
  };
  dataVendaInput: string = new Date().toISOString().split('T')[0];
  editandoVendaId: number | null = null;
  clienteIdSelecionado: string = '';
  loading = false;
  mostrarModal = false;

  // Filtros
  filtroClienteId: string = '';
  filtroDataInicio: string = '';
  filtroDataFim: string = '';

  constructor(
    private vendaService: VendaService,
    private clienteService: ClienteService
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
        this.aplicarFiltros();
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

  aplicarFiltros(): void {
    let vendasFiltradas = [...this.vendas];

    // Filtro por cliente
    if (this.filtroClienteId) {
      const clienteId = parseInt(this.filtroClienteId);
      vendasFiltradas = vendasFiltradas.filter(v => v.clienteId === clienteId);
    }

    // Filtro por data início
    if (this.filtroDataInicio) {
      const dataInicio = new Date(this.filtroDataInicio);
      dataInicio.setHours(0, 0, 0, 0);
      vendasFiltradas = vendasFiltradas.filter(v => {
        const dataVenda = typeof v.dataVenda === 'string' ? new Date(v.dataVenda) : v.dataVenda;
        dataVenda.setHours(0, 0, 0, 0);
        return dataVenda >= dataInicio;
      });
    }

    // Filtro por data fim
    if (this.filtroDataFim) {
      const dataFim = new Date(this.filtroDataFim);
      dataFim.setHours(23, 59, 59, 999);
      vendasFiltradas = vendasFiltradas.filter(v => {
        const dataVenda = typeof v.dataVenda === 'string' ? new Date(v.dataVenda) : v.dataVenda;
        dataVenda.setHours(0, 0, 0, 0);
        return dataVenda <= dataFim;
      });
    }

    this.vendasFiltradas = vendasFiltradas;
  }

  limparFiltros(): void {
    this.filtroClienteId = '';
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
    this.aplicarFiltros();
  }

  abrirModalNovaVenda(): void {
    this.limparFormulario();
    this.mostrarModal = true;
  }

  fecharModal(): void {
    this.mostrarModal = false;
    this.limparFormulario();
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
          this.fecharModal();
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
          this.fecharModal();
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
    this.mostrarModal = true;
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
      valorPago: 0,
      observacoes: ''
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
}
