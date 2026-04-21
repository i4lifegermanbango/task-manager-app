import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DeleteTaskModalComponent } from '../components/delete-task-modal/delete-task-modal.component';
import { AlertMessageModalComponent } from '../components/alert-message-modal/alert-message-modal.component';
import { FormularioInvitacionModalComponent } from '../components/formulario-invitacion-modal/formulario-invitacion-modal.component';

@NgModule({
  declarations: [
    DeleteTaskModalComponent,
    AlertMessageModalComponent,
    FormularioInvitacionModalComponent,
  ],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeleteTaskModalComponent,
    AlertMessageModalComponent,
    FormularioInvitacionModalComponent,
  ],
})
export class SharedModule {}
