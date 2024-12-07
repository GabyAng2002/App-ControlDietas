import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CaloriasService {
  private historialCalorias: { calorias: number, fecha: string }[] = [
    { calorias: 300, fecha: '2024-12-01' },
    { calorias: 1100, fecha: '2024-12-02' },
    { calorias: 2600, fecha: '2024-12-03' },
    { calorias: 1850, fecha: '2024-12-04' },
    { calorias: 985, fecha: '2024-12-05' }
  ];

  constructor() {}

  // Método para agregar calorías al historial con la fecha actual
  agregarCaloriasAlHistorial(calorias: number) {
    const fechaHoy = new Date().toISOString().split('T')[0];  // Formato YYYY-MM-DD
    this.historialCalorias.push({ calorias, fecha: fechaHoy });
  }

  // Método para obtener el historial de calorías
  obtenerHistorial() {
    return this.historialCalorias;
  }
}
