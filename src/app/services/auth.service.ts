import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: { id: number; name: string } | null = null; // Almacena la información del usuario
  private API_URL = 'https://api-controldietas.vercel.app/api';  // Url del backend

  constructor(private http: HttpClient, private router: Router) {
    // Inicializa el usuario desde el almacenamiento local, si existe
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null;
  }

  // Registrar un nuevo usuario
  register(user: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, user);
  }

  // Iniciar sesión
  login(user: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, user);
  }

  // Manejar el login exitoso
  handleLogin(response: any): void {
    this.user = { id: response.id, name: response.nombre };
    localStorage.setItem('user', JSON.stringify(this.user)); // Guardar en localStorage
  }

  // Obtener el nombre del usuario
  getUserName(): string {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null; // Carga el usuario almacenado
    return this.user ? this.user.name : 'Invitado'; // Devuelve el nombre del usuario o 'Invitado'
  }

  // Obtener el ID del usuario
  getUserId(): number | 0 {
    const storedUser = localStorage.getItem('user');
    this.user = storedUser ? JSON.parse(storedUser) : null; // Carga el usuario almacenado
    return this.user ? this.user.id : 0; // Devuelve el ID del usuario o null
  }

  // Cerrar sesión
  logout(): void {
    this.user = null; // Elimina la información del usuario
    localStorage.removeItem('user'); // Elimina del almacenamiento local
    this.router.navigate(['/login']); // Redirige a la página de login
  }

  // Verificar si hay un usuario logueado
  isLoggedIn(): boolean {
    return this.user !== null; // Comprueba si hay un usuario logueado
  }
}
