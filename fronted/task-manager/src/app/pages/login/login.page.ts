import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AlertMessageModalComponent } from '../../components/alert-message-modal/alert-message-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  username = '';
  password = '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
  ) {}

  login() {
    if (!this.fotmatoValido()) return;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        this.openErrorModal('Error', 'Usuario o contraseña incorrecto');
      },
    });
  }
  fotmatoValido(): boolean {
    if (!this.username.trim()) {
      this.openErrorModal('Error', 'El usuario es obligatorio');
      return false;
    }

    if (!this.password.trim()) {
      this.openErrorModal('Error', 'La contraseña es obligatoria');
      return false;
    }

    return true;
  }

  async openErrorModal(titulo: string, mensaje: string) {
    const modal = await this.modalCtrl.create({
      component: AlertMessageModalComponent,
      componentProps: {
        titulo,
        mensaje,
        mostrarCancelar: false,
      },
      cssClass: 'custom-modal',
    });

    await modal.present();
  }

  goToRegistro() {
    this.router.navigate(['/registro']);
  }
}
