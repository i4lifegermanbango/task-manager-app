import { Component, OnInit } from '@angular/core';
import { TagService, Tag } from '../../services/tag.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AlertMessageModalComponent } from '../../components/alert-message-modal/alert-message-modal.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.page.html',
  styleUrls: ['./tags.page.scss'],
  standalone: false,
})
export class TagsPage implements OnInit {
  tags: Tag[] = [];
  newTagName: string = '';

  constructor(
    private tagService: TagService,
    private router: Router,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.tagService.getTags().subscribe((tags) => {
      this.tags = tags;
    });
  }

  async openErrorModal() {
    const modal = await this.modalCtrl.create({
      component: AlertMessageModalComponent,
      componentProps: {
        titulo: 'Error',
        mensaje: 'El nombre del tag es obligatorio',
        mostrarCancelar: false,
      },
      cssClass: 'custom-modal',
    });

    await modal.present();
  }

  addTag() {
    if (!this.newTagName.trim()) {
      this.openErrorModal();
      return;
    }
    this.tagService.createTag(this.newTagName).subscribe(() => {
      this.newTagName = '';
      this.loadTags();
    });
  }

  updateTag(tag: Tag) {
    const newName = prompt('Nuevo nombre', tag.name);
    if (!newName) return;

    this.tagService.updateTag(tag._id!, newName).subscribe(() => {
      this.loadTags();
    });
  }

  deleteTag(tag: Tag) {
    this.tagService.deleteTag(tag._id!).subscribe(() => {
      this.loadTags();
    });
  }

  volver() {
    this.router.navigate(['/home']);
    this.newTagName = '';
  }
}
