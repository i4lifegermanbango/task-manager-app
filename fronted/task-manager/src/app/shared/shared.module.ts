import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DeleteTaskModalComponent } from '../components/delete-task-modal/delete-task-modal.component';

@NgModule({
  declarations: [DeleteTaskModalComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [CommonModule, FormsModule, IonicModule, DeleteTaskModalComponent],
})
export class SharedModule {}
