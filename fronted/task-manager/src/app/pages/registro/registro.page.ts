import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular';
import { AlertMessageModalComponent } from '../../components/alert-message-modal/alert-message-modal.component';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage implements OnInit {
  name = '';
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  passwordValid = false;

  constructor(
    private router: Router,
    private authAervice: AuthService,
    private modalCtrl: ModalController,
  ) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  async openErrorModal() {
    const modal = await this.modalCtrl.create({
      component: AlertMessageModalComponent,
      componentProps: {
        titulo: 'Error',
        mensaje: 'Formato incorrecto para el registro',
        mostrarCancelar: false,
      },
      cssClass: 'custom-modal',
    });

    await modal.present();
  }

  checkPasswordStrength(password: string): boolean {
    if (!password) return false;

    const minLength = password.length >= 6;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    const criteriaCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(
      Boolean,
    ).length;

    return minLength && criteriaCount >= 2;
  }

  onPasswordChange() {
    this.passwordValid = this.checkPasswordStrength(this.password);
  }

  registrar() {
    if (!this.formValido()) {
      this.openErrorModal();
    } else {
      this.authAervice
        .register(this.username, this.password, this.name, this.email)
        .subscribe((res: any) => {
          console.log(res);
        });
    }
  }

  formValido(): boolean {
    return (
      this.emailRegex.test(this.email) &&
      this.password === this.confirmPassword &&
      this.username !== '' &&
      this.name !== ''
    );
  }

  ngOnInit() {}
}
