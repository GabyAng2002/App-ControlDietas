import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-modal-camara',
  templateUrl: './modal-camara.component.html',
  styleUrls: ['./modal-camara.component.scss'],
})

export class ModalCamaraComponent implements AfterViewInit, OnDestroy {
  imageUrl: string | undefined;
  isDesktop: boolean;
  videoStreamActive = false;
  cameraPermissionDenied = false; // Nuevo estado para los permisos
  private videoStream: MediaStream | null = null;

  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;

  constructor(private modalController: ModalController, private http: HttpClient) {
    this.isDesktop = !this.isMobile();
  }

  ngAfterViewInit() {
    if (this.isDesktop) {
      this.takePhotoWithWebCamera();
    }
  }

  ngOnDestroy() {
    this.stopVideoStream();
  }

  isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  async takePhoto() {
    if (this.isDesktop) {
      await this.takePhotoWithWebCamera();
    } else {
      await this.takePhotoWithCapacitorCamera();
    }

    // Después de tomar la foto, guarda la imagen en base64 en la base de datos
    if (this.imageUrl) {
      this.savePhotoToDatabase(this.imageUrl); // Llama a la función para guardar la foto
    }
  }

  async takePhotoWithWebCamera() {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.videoStreamActive = true;
      this.cameraPermissionDenied = false; // Si tenemos acceso, restablecemos el estado
      this.video.nativeElement.srcObject = this.videoStream;

      // Captura una imagen luego de una breve pausa solo en escritorio
      if (this.isDesktop) {
        setTimeout(() => {
          this.captureImageFromVideo();
        }, 1000);
      } else {
        this.captureImageFromVideo(); // En móvil, tomar la foto directamente
      }
    } catch (error) {
      this.cameraPermissionDenied = true;
      console.error('Error accediendo a la cámara:', error);
    }
  }

  captureImageFromVideo() {
    const canvas = document.createElement('canvas');
    const video = this.video.nativeElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imageUrl = canvas.toDataURL('image/png');
    }

    // Detener el stream de video después de capturar la imagen
    this.stopVideoStream();
  }

  async takePhotoWithCapacitorCamera() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    this.imageUrl = image.dataUrl;
  }

  stopVideoStream() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.videoStream = null;
      this.videoStreamActive = false;
    }
  }

  savePhotoToDatabase(image: string) {
    const photoData = {
      photo: image,  // La imagen en base64
    };

    this.http.post('https://api-controldietas.vercel.app/photo/photos', photoData).subscribe(response => {
      console.log('Foto guardada con éxito', response);
    }, error => {
      console.error('Error al guardar la foto', error);
    });
  }

  dismissModal() {
    this.stopVideoStream(); // Asegúrate de detener el stream al cerrar el modal
    this.modalController.dismiss();
  }
}