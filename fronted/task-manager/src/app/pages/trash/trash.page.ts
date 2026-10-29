import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { TagService, Tag } from '../../services/tag.service';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular';
import { DeleteTaskModalComponent } from '../../components/delete-task-modal/delete-task-modal.component';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.page.html',
  styleUrls: ['./trash.page.scss'],
  standalone: false,
})
export class TrashPage implements OnInit {
  constructor(
    private router: Router,
    private tagService: TagService,
    private taskService: TaskService,
    private authService: AuthService,
    private modalCtrl: ModalController,
  ) {}
  menuOpen: boolean = false;
  tasks: any[] = [];
  newTaskTitle: string = '';
  rol = '';
  selectedStatus: string = 'pendiente';
  selectedFile: File | null = null;
  tagSearch: string = '';
  allTags: Tag[] = [];
  filteredTags: Tag[] = [];
  selectedTags: Tag[] = [];
  filterTagSearch: string = '';
  filterFilteredTags: Tag[] = [];
  filterSelectedTags: Tag[] = [];
  selectedIds: string[] = [];

  openFilter: boolean = false;

  ionViewWillEnter() {
    this.loadTasks();
    this.loadTags();
    this.rol = this.authService.getRol() || '';
  }

  toggleSelect(id: string | undefined) {
    if (!id) return;
    const index = this.selectedIds.indexOf(id);
    if (index === -1) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds.splice(index, 1);
    }
  }

  isSelected(id: string | undefined): boolean {
    if (!id) return false;
    return this.selectedIds.includes(id);
  }

  restoreSelected() {
    if (this.selectedIds.length === 0) return;

    this.taskService.restoreSelected(this.selectedIds).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(
          (t) => !this.selectedIds.includes(t._id),
        );
        this.selectedIds = [];
      },
      error: (err) => console.error('Error al restaurar seleccionados:', err),
    });
  }

  deleteSelected() {
    if (this.selectedIds.length === 0) return;

    const toDelete = this.tasks.filter((t) => this.selectedIds.includes(t._id));

    const deletes$ = toDelete.map((task) => this.taskService.deleteTask(task));

    Promise.all(deletes$.map((obs) => obs.toPromise()))
      .then(() => {
        this.tasks = this.tasks.filter(
          (t) => !this.selectedIds.includes(t._id),
        );
        this.selectedIds = [];
      })
      .catch((err) => console.error('Error al eliminar seleccionados:', err));
  }

  async openDeleteModal(task: any) {
    const isAdmin = this.rol === 'administrador';

    if (!isAdmin) {
      this.taskService.deleteTask(task, false).subscribe(() => {
        this.tasks = this.tasks.filter((t) => t._id !== task._id);
      });
      return;
    }

    if (task.userRol !== 'user') {
      this.taskService.deleteTask(task, false).subscribe(() => {
        this.tasks = this.tasks.filter((t) => t._id !== task._id);
      });
      return;
    }

    const modal = await this.modalCtrl.create({
      component: DeleteTaskModalComponent,
      cssClass: 'custom-modal',
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.confirmado) {
      this.taskService.deleteTask(task, data.avisar).subscribe(() => {
        this.tasks = this.tasks.filter((t) => t._id !== task._id);
      });
    }
  }

  restoreAll() {
    this.taskService.restoreAll().subscribe({
      next: () => {
        this.tasks = [];
        this.selectedIds = [];
      },
      error: (err) => console.error('Error al restaurar todo:', err),
    });
  }

  deleteAll() {
    this.taskService.deleteAllTasks().subscribe({
      next: () => {
        this.tasks = [];
        this.selectedIds = [];
      },
      error: (err) => console.error('Error al vaciar papelera:', err),
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  filterTagsGlobal() {
    this.openFilter = true;

    this.filterFilteredTags = this.filterTagsLogic(
      this.filterTagSearch,
      this.allTags,
    );

    if (!this.filterTagSearch.trim()) {
      this.filterSelectedTags = [];
    }
  }
  loadTasks() {
    this.taskService.getTrashTasks().subscribe((tasks) => {
      console.log('TRASH:', tasks);
      this.tasks = tasks;
    });
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

  loadTags() {
    this.tagService.getTags().subscribe((tags) => {
      this.allTags = tags;
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

  openTask(task: Task) {
    this.selectedTags = [...(task.tags || [])];
  }

  get filteredTasks() {
    let result = this.tasks;

    if (this.filterSelectedTags.length > 0) {
      result = result.filter((task) =>
        this.filterSelectedTags.some((ft) =>
          task.tags?.some((tag: Tag) => tag._id === ft._id),
        ),
      );
    }

    return result;
  }
  filterTagsLogic(search: string, tags: Tag[]): Tag[] {
    const value = search.toLowerCase();

    if (!value) return tags;

    return tags.filter((tag) => tag.name.toLowerCase().includes(value));
  }

  filterTags(task: any) {
    task.filteredTags = this.filterTagsLogic(task.tagSearch, this.allTags);
  }

  selectTag(task: any, tag: Tag) {
    console.log(task);
    console.log(tag);

    task.keepOpen = true;

    if (!task.selectedTags.find((t: Tag) => t._id === tag._id)) {
      task.selectedTags.push(tag);
      task.tags = [...task.selectedTags];
    }

    task.tagSearch = '';
    task.filteredTags = [];
  }

  closeFilterDelayed() {
    setTimeout(() => {
      this.openFilter = false;
    }, 200);
  }

  selectFilterTag(tag: Tag) {
    if (!this.filterSelectedTags.find((t) => t._id === tag._id)) {
      this.filterSelectedTags.push(tag);
    }

    this.filterTagSearch = tag.name;

    this.filterFilteredTags = [];
    this.openFilter = false;
  }

  goToHome() {
    this.menuOpen = false;
    this.router.navigate(['/home']);
  }

  logout() {
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: any) {
    const clickedInside =
      event.target.closest('.filter-wrapper') ||
      event.target.closest('.filter-dropdown');

    if (!clickedInside) {
      this.openFilter = false;
    }
  }

  ngOnInit() {
    this.loadTasks();
    this.loadTags();
  }
}
