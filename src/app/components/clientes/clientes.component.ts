import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="clientes-container">
      <header class="dashboard-header">
        <h1>JL Modas - Clientes</h1>
        <nav class="nav-menu">
          <a routerLink="/dashboard" class="nav-item">Dashboard</a>
          <a routerLink="/clientes" class="nav-item active">Clientes</a>
          <a routerLink="/vendas" class="nav-item">Vendas</a>
          <button class="btn btn-danger" (click)="logout()">Sair</button>
        </nav>
      </header>

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
                <td>{{ cliente.numero }}</td>
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
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
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

  formatarValor(valor: number): string {
    return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

