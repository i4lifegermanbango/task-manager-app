import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DeleteTaskModalComponent } from '../components/delete-task-modal/delete-task-modal.component';
import { ErrorCreateTagComponent } from '../components/error-create-tag/error-create-tag.component';
import { ErrorCreateTaskComponent } from '../components/error-create-task/error-create-task.component';
import { ErrorLoginComponent } from '../components/error-login/error-login.component';
import { ErrorRegistroComponent } from '../components/error-registro/error-registro.component';

@NgModule({
  declarations: [
    DeleteTaskModalComponent,
    ErrorCreateTagComponent,
    ErrorCreateTaskComponent,
    ErrorLoginComponent,
    ErrorRegistroComponent,
  ],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeleteTaskModalComponent,
    ErrorCreateTagComponent,
    ErrorCreateTaskComponent,
    ErrorLoginComponent,
    ErrorRegistroComponent,
  ],
})
export class SharedModule {}
