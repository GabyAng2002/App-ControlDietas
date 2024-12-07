import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router'; // Importa Router para redireccionar
import { Subscription } from 'rxjs';
import { TabService } from '../../services/tab.service';
import { HttpClient } from '@angular/common/http';

import { ModalController } from '@ionic/angular';
import { ModalCamaraComponent } from "../../components/modal-camara/modal-camara.component";
import { ChangeDetectorRef } from '@angular/core';

interface Photo {
  _id: string;  // El id de la foto
  image: string; // La imagen en base64
}

@Component({
  selector: 'app-camara',
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
})

export class CamaraPage implements OnInit, OnDestroy {

  isProfileMenuOpen: boolean = false; // Controlar si el menú está abierto o cerrado
  isLoggedIn: boolean = false;
  userName: string; // Variable para almacenar el nombre del usuario
  userId: number;
  photos: Photo[] = []; // Array para almacenar las fotos capturadas
  private routerSubscription!: Subscription; // Suscripción a eventos de navegación


  constructor(
    private modalController: ModalController,
    private authService: AuthService, // Servicio de autenticación
    private router: Router, // Router para redireccionar
    public tabService: TabService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {
    // Inicializar el nombre del usuario y el estado de autenticación
    this.userName = this.authService.getUserName(); // Método para obtener el nombre del usuario
    this.isLoggedIn = !!this.userName; // Comprobar si el usuario está autenticado
    this.userId = this.authService.getUserId(); //Obtener el ID del usuario para peticiones en los servicios
  }
  ngOnInit() {
    this.loadUserData(); //Cargar datos del usuario
    this.subscribeToRouterEvents();
    this.loadPhotos();
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

  async openCameraModal() {
    const modal = await this.modalController.create({
      component: ModalCamaraComponent,
    });

    // Escuchar el resultado del modal cuando se cierre
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Agregar la foto capturada al array de fotos
        this.photos.push(result.data);

        // Forzar la detección de cambios
        this.cdRef.detectChanges(); // Fuerza la actualización de la vista

        // Actualizar las fotos desde la base de datos
        this.loadPhotos();
      }
    });

    return await modal.present();
  }

  loadPhotos() {
    this.http.get<Photo[]>('https://api-controldietas.vercel.app/photo/photos').subscribe((photos) => {
      // Extraer solo las imágenes en Base64
      this.photos = photos;
    }, error => {
      console.error('Error al cargar las fotos', error);
    });
  }

  deletePhoto(photoId: string) {
    this.http.delete(`https://api-controldietas.vercel.app/photo/photos/${photoId}`).subscribe(
      () => {
        // Si la eliminación fue exitosa, eliminamos la foto del array local
        this.photos = this.photos.filter(photo => photo._id !== photoId);
      },
      (error) => {
        console.error('Error al eliminar la foto', error);
      }
    );
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

  // Alternar el estado de apertura/cierre del menú de perfil
  toggleProfileMenu() {
    this.tabService.selectedTab = 'profile';
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }
}
