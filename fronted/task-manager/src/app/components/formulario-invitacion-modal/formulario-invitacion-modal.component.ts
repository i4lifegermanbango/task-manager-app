import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-formulario-invitacion-modal',
  templateUrl: './formulario-invitacion-modal.component.html',
  styleUrls: ['./formulario-invitacion-modal.component.scss'],
  standalone: false,
})
export class FormularioInvitacionModalComponent implements OnInit {
  titulo: string = '';
  mensaje: string = '';
  usuarioSeleccionado: string = '';
  selectedFile: File | null = null;
  usuarios: User[] = [];

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService, // 👈 corregido
  ) {}

  ngOnInit() {
    this.authService.getUsers().subscribe((users) => {
      // 👈 corregido
      this.usuarios = users;
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  enviar() {
    if (!this.titulo.trim() || !this.usuarioSeleccionado) return;

    const formData = new FormData();
    formData.append('title', this.titulo);
    formData.append('userId', this.usuarioSeleccionado);
    formData.append('mensaje', this.mensaje);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.modalCtrl.dismiss({ formData });
  }

  cerrar() {
    this.modalCtrl.dismiss(null);
  }
}
