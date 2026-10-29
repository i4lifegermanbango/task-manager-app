import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delete-task-modal',
  templateUrl: './delete-task-modal.component.html',
  styleUrls: ['./delete-task-modal.component.scss'],
  standalone: false,
})
export class DeleteTaskModalComponent implements OnInit {
  avisarUsuario: boolean = false;

  constructor(private modalCtrl: ModalController) {}

  cancelar() {
    this.modalCtrl.dismiss({
      confirmado: false,
    });
  }

  confirmar() {
    this.modalCtrl.dismiss({
      confirmado: true,
      avisar: this.avisarUsuario,
    });
  }
  ngOnInit() {}
}
