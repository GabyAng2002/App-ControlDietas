import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router'; // Importa Router para redireccionar
import { Subscription } from 'rxjs';
import {ModalController} from "@ionic/angular";
import { NavController } from '@ionic/angular';

import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';
import {PluginListenerHandle} from "@capacitor/core";

import { TabService } from '../../services/tab.service';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage implements OnInit {
  isProfileMenuOpen: boolean = false; // Controlar si el menú está abierto o cerrado
  isLoggedIn: boolean = false;
  userName: string; // Variable para almacenar el nombre del usuario
  userId: number;
  private routerSubscription!: Subscription; // Suscripción a eventos de navegación

  acceleration: { x: number; y: number; z: number } | null = null;

  watchId: PluginListenerHandle | undefined;
  location: { latitude: number; longitude: number } | null = null;

  private map: any;
  private marker: any;

  constructor(
    private authService: AuthService, // Servicio de autenticación
    private router: Router, // Router para redireccionar
    public tabService: TabService,
    private navCtrl: NavController
  ) {
    // Inicializar el nombre del usuario y el estado de autenticación
    this.userName = this.authService.getUserName(); // Método para obtener el nombre del usuario
    this.isLoggedIn = !!this.userName; // Comprobar si el usuario está autenticado
    this.userId = this.authService.getUserId(); //Obtener el ID del usuario para peticiones en los servicios
   }

  ngOnInit() {
    this.loadUserData(); //Cargar datos del usuario
    this.subscribeToRouterEvents();
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

  async getLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.location = {
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude,
    };
  
    // Mostrar o actualizar el marcador en la ubicación actual
    this.showUserLocationOnMap(this.location.latitude, this.location.longitude);
  }
  
  showUserLocationOnMap(latitude: number, longitude: number) {
    if (!this.map) {
      // Si el mapa no existe, inicialízalo
      this.map = L.map('map').setView([latitude, longitude], 17);
  
      // Agrega capas de mapa
      const streets = L.tileLayer(
        'https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia29oYWt1dG9ueSIsImEiOiJjbTJ3OTJ6dHAwNGRxMmtwdzJpbGgxbTdpIn0.Zms7JE5cAxtk70RY9Llkmw',
        {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1,
        }
      );
      streets.addTo(this.map);
    }
  
    // Agrega o actualiza el marcador del usuario
    if (this.marker) {
      this.marker.setLatLng([latitude, longitude]);
      this.marker.bindPopup('You are here!').openPopup();
    } else {
      this.marker = L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: 'path/to/marker-icon.png', // Usa un ícono personalizado si lo deseas
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      })
        .addTo(this.map)
        .bindPopup('You are here!')
        .openPopup();
    }
  
    // Centra el mapa en la ubicación del usuario
    this.map.setView([latitude, longitude], 17);
  }
  
  async startWatching() {
    this.watchId = await Motion.addListener('accel', (event: any) => {
      this.acceleration = {
        x: event.acceleration?.x || 0,
        y: event.acceleration?.y || 0,
        z: event.acceleration?.z || 0,
      };
    });
  }

  stopWatching() {
    if (this.watchId) {
      Motion.removeAllListeners();
      if (this.watchId !== null){
        this.watchId = undefined;
      }

    }
  }

  ngOnDestroy() {
    // Cancelar la suscripción para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
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

  goToUbiPage() {
    this.tabService.selectedTab = 'ubi';
    this.router.navigate(['/ubicacion']);
  }

  // Alternar el estado de apertura/cierre del menú de perfil
  toggleProfileMenu() {
    this.tabService.selectedTab = 'profile';
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }
}
