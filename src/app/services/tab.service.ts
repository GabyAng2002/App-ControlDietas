import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TabService {
  selectedTab: string = 'home'; // Valor inicial
}