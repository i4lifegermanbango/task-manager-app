import { ModalController } from '@ionic/angular';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-create-tag',
  templateUrl: './alert-message-modal.component.html',
  styleUrls: ['./alert-message-modal.component.scss'],
  standalone: false,
})
export class AlertMessageModalComponent {
  @Input() titulo: string = 'Aviso';
  @Input() mensaje: string = '';
  @Input() tipo: 'error' | 'success' | 'warning' = 'error';
  @Input() mostrarCancelar: boolean = false;
  constructor(private modalCtrl: ModalController) {}

  cerrar(confirmado: boolean = true) {
    this.modalCtrl.dismiss({ confirmado });
  }
}
