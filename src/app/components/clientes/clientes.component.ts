import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clientes-container">
      <div class="page-header">
        <h1>Clientes</h1>
        <p class="page-subtitle">Gerencie seus clientes</p>
      </div>

      <div class="container">
        <div class="card">
          <h2>Cadastrar Novo Cliente</h2>
          <form (ngSubmit)="salvarCliente()">
            <div class="form-group">
              <label for="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                [(ngModel)]="clienteForm.nome"
                name="nome"
                required
                placeholder="Nome completo"
              />
            </div>
            <div class="form-group">
              <label for="numero">Número:</label>
              <input
                type="text"
                id="numero"
                [(ngModel)]="clienteForm.numero"
                name="numero"
                required
                placeholder="(00) 00000-0000"
                maxlength="15"
                (input)="aplicarMascaraTelefone($event)"
              />
            </div>
            <button type="submit" class="btn btn-primary">
              {{ editandoClienteId ? 'Atualizar' : 'Cadastrar' }} Cliente
            </button>
            <button *ngIf="editandoClienteId" type="button" class="btn btn-danger" (click)="cancelarEdicao()">
              Cancelar
            </button>
          </form>
        </div>

        <div class="card">
          <h2>Lista de Clientes</h2>
          <div *ngIf="loading" class="loading">Carregando clientes...</div>
          
          <table *ngIf="!loading" class="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Número</th>
                <th>Valor Devido</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cliente of clientes">
                <td>{{ cliente.nome }}</td>
                <td>{{ formatarTelefone(cliente.numero) }}</td>
                <td>R$ {{ formatarValor(cliente.valorDevido || 0) }}</td>
                <td>
                  <button class="btn btn-primary" (click)="editarCliente(cliente)" style="margin-right: 5px;">
                    Editar
                  </button>
                  <button class="btn btn-danger" (click)="deletarCliente(cliente.id!)" *ngIf="cliente.id">
                    Excluir
                  </button>
                </td>
              </tr>
              <tr *ngIf="clientes.length === 0">
                <td colspan="4" style="text-align: center;">Nenhum cliente cadastrado</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clientes-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 32px;
    }

    .page-header {
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

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #1e3a8a;
      box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-right: 8px;
    }

    .btn-primary {
      background-color: #1e3a8a;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1e40af;
    }

    .btn-danger {
      background-color: #dc2626;
      color: white;
    }

    .btn-danger:hover {
      background-color: #b91c1c;
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
  `]
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteForm: Cliente = {
    nome: '',
    numero: ''
  };
  editandoClienteId: string | null = null;
  loading = false;

  constructor(
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.loading = true;
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.loading = false;
        // Em desenvolvimento, você pode adicionar dados mock aqui
      }
    });
  }

  salvarCliente(): void {
    if (!this.clienteForm.nome || !this.clienteForm.numero) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    if (this.editandoClienteId) {
      const id = parseInt(this.editandoClienteId);
      this.clienteService.atualizarCliente(id, this.clienteForm).subscribe({
        next: () => {
          this.carregarClientes();
          this.limparFormulario();
        },
        error: (err) => {
          console.error('Erro ao atualizar cliente:', err);
          alert('Erro ao atualizar cliente');
        }
      });
    } else {
      this.clienteService.criarCliente(this.clienteForm).subscribe({
        next: () => {
          this.carregarClientes();
          this.limparFormulario();
        },
        error: (err) => {
          console.error('Erro ao criar cliente:', err);
          alert('Erro ao criar cliente');
        }
      });
    }
  }

  editarCliente(cliente: Cliente): void {
    this.clienteForm = { ...cliente };
    // Formata o número se já não estiver formatado
    if (cliente.numero && !cliente.numero.includes('(')) {
      const numeros = cliente.numero.replace(/\D/g, '');
      if (numeros.length <= 10) {
        this.clienteForm.numero = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
      } else {
        this.clienteForm.numero = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
      }
    }
    this.editandoClienteId = cliente.id?.toString() || null;
  }

  cancelarEdicao(): void {
    this.limparFormulario();
  }

  deletarCliente(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clienteService.deletarCliente(id).subscribe({
        next: () => {
          this.carregarClientes();
        },
        error: (err) => {
          console.error('Erro ao deletar cliente:', err);
          alert('Erro ao deletar cliente');
        }
      });
    }
  }

  limparFormulario(): void {
    this.clienteForm = {
      nome: '',
      numero: ''
    };
    this.editandoClienteId = null;
  }

  aplicarMascaraTelefone(event: any): void {
    let valor = event.target.value;
    // Remove tudo que não é dígito
    valor = valor.replace(/\D/g, '');
    
    // Limita a 11 dígitos (máximo para celular brasileiro)
    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }
    
    // Aplica a máscara conforme o tamanho
    if (valor.length <= 2) {
      valor = valor;
    } else if (valor.length <= 6) {
      valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    } else if (valor.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 6)}-${valor.substring(6)}`;
    } else {
      // Celular: (00) 00000-0000
      valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7, 11)}`;
    }
    
    this.clienteForm.numero = valor;
  }

  formatarTelefone(numero: string): string {
    if (!numero) return '';
    // Se já estiver formatado, retorna como está
    if (numero.includes('(')) return numero;
    // Remove tudo que não é dígito
    const numeros = numero.replace(/\D/g, '');
    // Aplica a máscara
    if (numeros.length <= 10) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    } else {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
    }
  }

  formatarValor(valor: number): string {
    return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

