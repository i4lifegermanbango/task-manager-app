import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { InvitacionService } from '../../services/invitacion.service';
import { FormularioInvitacionModalComponent } from '../../components/formulario-invitacion-modal/formulario-invitacion-modal.component';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})
export class NotificacionesPage implements OnInit {
  menuOpen: boolean = false;
  rol = '';
  invitaciones: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
    private invitacionService: InvitacionService,
  ) {}

  ionViewWillEnter() {
    this.rol = this.authService.getRol() || '';
    this.loadInvitaciones();
  }

  loadInvitaciones() {
    this.invitacionService.getInvitaciones().subscribe((invitaciones) => {
      this.invitaciones = invitaciones.map((inv) => ({
        ...inv,
        expanded: false,
      }));
    });
  }

  toggleExpanded(inv: any) {
    inv.expanded = !inv.expanded;
  }

  formatFecha(fecha: string): string {
    const d = new Date(fecha);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const anio = d.getFullYear();
    const horas = d.getHours().toString().padStart(2, '0');
    const minutos = d.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En proceso';
      case 'completada':
        return 'Completada';
      default:
        return 'Desconocido';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pendiente':
        return 'time-outline';
      case 'en_proceso':
        return 'sync-outline';
      case 'completada':
        return 'checkmark-circle-outline';
      default:
        return 'help-circle-outline';
    }
  }

  async abrirModalCrear() {
    this.menuOpen = false;

    const modal = await this.modalCtrl.create({
      component: FormularioInvitacionModalComponent,
      cssClass: 'custom-modal',
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.formData) {
      this.invitacionService.crearInvitacion(data.formData).subscribe({
        next: (inv) => {
          this.invitaciones.push({ ...inv, expanded: false });
        },
        error: (err) => console.error('Error al crear invitación:', err),
      });
    }
  }

  gestionar(inv: any, aceptar: boolean) {
    this.invitacionService.gestionarInvitacion(inv._id, aceptar).subscribe({
      next: () => {
        this.invitaciones = this.invitaciones.filter((i) => i._id !== inv._id);
      },
      error: (err) => console.error('Error al gestionar invitación:', err),
    });
  }

  getUserDisplay(task: any): string {
    if (task.userRol === 'administrador') {
      return 'Administrador';
    }
    if (task.userId && typeof task.userId === 'object') {
      return task.userId.name;
    }
    return 'Usuario';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goToHome() {
    this.menuOpen = false;
    this.router.navigate(['/home']);
  }

  logout() {
    this.authService.logout();
  }

  ngOnInit() {}
}
