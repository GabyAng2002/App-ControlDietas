import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router'; // Importa Router para redireccionar
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';

import { TabService } from '../../services/tab.service';
import { CaloriasService } from 'src/app/services/calorias.service';

Chart.register(...registerables);

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  historialCalorias: { calorias: number, fecha: string }[] = [];
  isProfileMenuOpen: boolean = false; // Controlar si el menú está abierto o cerrado
  isLoggedIn: boolean = false;
  userName: string; // Variable para almacenar el nombre del usuario
  userId: number;
  private routerSubscription!: Subscription; // Suscripción a eventos de navegación

  constructor(
    private authService: AuthService, // Servicio de autenticación
    private router: Router, // Router para redireccionar
    public tabService: TabService,
    private caloriasService: CaloriasService,
    private navCtrl: NavController,
  ) {
    // Inicializar el nombre del usuario y el estado de autenticación
    this.userName = this.authService.getUserName(); // Método para obtener el nombre del usuario
    this.isLoggedIn = !!this.userName; // Comprobar si el usuario está autenticado
    this.userId = this.authService.getUserId(); //Obtener el ID del usuario para peticiones en los servicios
   }

  ngOnInit() {
    this.loadUserData(); //Cargar datos del usuario
    this.subscribeToRouterEvents();
    this.historialCalorias = this.caloriasService.obtenerHistorial();
    this.crearGrafico();
  }

   // Carga datos del usuario
   private loadUserData() {
    this.userName = this.authService.getUserName();
    this.userId = this.authService.getUserId();
    this.isLoggedIn = !!this.userName;
  }

  // Suscripción a eventos de navegación
  private subscribeToRouterEvents() {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeProfileMenu();
        this.loadUserData();
      }
    });
  }

  ngOnDestroy() {
    // Cancelar la suscripción para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  crearGrafico() {
    // Obtener el contexto del canvas
    const ctx = document.getElementById('caloriasChart') as HTMLCanvasElement;

    // Crear gráfico con Chart.js
    new Chart(ctx, {
      type: 'line', // Puedes cambiar el tipo de gráfico a 'bar', 'line', etc.
      data: {
        labels: this.historialCalorias.map((registro) => registro.fecha), // Etiquetas (fechas)
        datasets: [{
          label: 'Calorías Consumidas',
          data: this.historialCalorias.map((registro) => registro.calorias), // Datos (calorías)
          borderColor: '#42A5F5', // Color de la línea
          fill: false, // No llenar el área debajo de la línea
          tension: 0.1, // Suavizado de la curva
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true, // Iniciar el eje Y en cero
          },
        },
      },
    });
  }

  getIcon(calorias: number): string {
    if (calorias < 1500) {
      return 'person-outline';  // Persona delgada
    } else if (calorias >= 1500 && calorias < 2500) {
      return 'person';  // Persona llenita
    } else {
      return 'body';  // Persona obesa
    }
  }

  // Método para cerrar sesión
  logout() {
    this.authService.logout(); // Lógica para cerrar sesión
    this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión
  }

  // Método para iniciar sesión
  login() {
    this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión
  }

  // Cerrar el menú de perfil
  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  goToHomePage() {
    this.tabService.selectedTab = 'home';
    this.router.navigate(['/home']);
  }

  goToHistPage() {
    this.tabService.selectedTab = 'hist';
    this.router.navigate(['/historial']);
  }

  goToCamPage() {
    this.tabService.selectedTab = 'cam';
    this.router.navigate(['/camara']);
  }
  // Alternar el estado de apertura/cierre del menú de perfil
  toggleProfileMenu() {
    this.tabService.selectedTab = 'profile';
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }
}
