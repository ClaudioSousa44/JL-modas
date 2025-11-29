import { Cliente } from './cliente.model';

export interface Venda {
  id?: number;
  clienteId: number;
  cliente?: Cliente;
  valor: number;
  dataVenda: Date | string;
  pagoCompleto: boolean;
  valorPago?: number;
  valorRestante?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

