export interface Cliente {
  id?: number;
  nome: string;
  numero: string;
  valorDevido?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

