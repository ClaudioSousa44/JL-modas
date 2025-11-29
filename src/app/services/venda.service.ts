import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venda } from '../models/venda.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getVendas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/vendas`, {
      headers: this.getHeaders()
    });
  }

  getVenda(id: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.apiUrl}/vendas/${id}`, {
      headers: this.getHeaders()
    });
  }

  criarVenda(venda: Venda): Observable<Venda> {
    return this.http.post<Venda>(`${this.apiUrl}/vendas`, venda, {
      headers: this.getHeaders()
    });
  }

  atualizarVenda(id: number, venda: Venda): Observable<Venda> {
    return this.http.put<Venda>(`${this.apiUrl}/vendas/${id}`, venda, {
      headers: this.getHeaders()
    });
  }

  deletarVenda(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vendas/${id}`, {
      headers: this.getHeaders()
    });
  }

  getEstatisticasVendas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendas/estatisticas`, {
      headers: this.getHeaders()
    });
  }
}

