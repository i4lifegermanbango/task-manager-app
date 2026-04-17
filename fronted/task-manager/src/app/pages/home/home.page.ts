import { Component, OnInit, HostListener } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TagService, Tag } from '../../services/tag.service';
import { DeleteTaskModalComponent } from '../../components/delete-task-modal/delete-task-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
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

  openFilter: boolean = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private tagService: TagService,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.resetState();
    this.rol = this.authService.getRol() || '';
    this.loadTasks();
    this.loadTags();
  }

  resetState() {
    this.tasks = [];
    this.filterSelectedTags = [];
    this.filterTagSearch = '';
    this.openFilter = false;
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

  filterTagsLogic(search: string, tags: Tag[]): Tag[] {
    const value = search.toLowerCase();

    if (!value) return tags;

    return tags.filter((tag) => tag.name.toLowerCase().includes(value));
  }

  loadTasks() {
    this.taskService.getTask().subscribe((tasks) => {
      this.tasks = tasks.map((task) => ({
        ...task,
        expanded: false,
        tagSearch: '',
        filteredTags: [],
        selectedTags: [...(task.tags || [])],
      }));
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

  addTask() {
    if (!this.newTaskTitle.trim()) return;

    const formData = new FormData();
    formData.append('title', this.newTaskTitle);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.taskService.addTask(formData).subscribe((task) => {
      this.tasks.push({
        ...task,
        expanded: false,
      });
      this.newTaskTitle = '';
      this.selectedFile = null;
    });
  }

  toggleTask(task: Task) {
    this.taskService.toggleTask(task._id!).subscribe((updatedTask) => {
      task.completed = updatedTask.completed;
    });
  }

  loadTags() {
    this.tagService.getTags().subscribe((tags) => {
      this.allTags = tags;
    });
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
  removeSelectedTag(task: any, tag: Tag) {
    task.selectedTags = task.selectedTags.filter((t: Tag) => t._id !== tag._id);
  }

  saveTags(task: any) {
    const currentTagIds = task.tags?.map((t: Tag) => t._id!) || [];
    const newTagIds = task.selectedTags.map((t: Tag) => t._id!);

    newTagIds.forEach((tagId: string) => {
      if (!currentTagIds.includes(tagId)) {
        this.taskService
          .addTagToTask(task._id!, tagId)
          .subscribe((updatedTask) => {
            task.tags = updatedTask.tags;
          });
      }
    });

    currentTagIds.forEach((tagId: string) => {
      if (!newTagIds.includes(tagId)) {
        this.taskService
          .removeTagFromTask(task._id!, tagId)
          .subscribe((updatedTask) => {
            task.tags = updatedTask.tags;
          });
      }
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
    let result = this.tasks.filter((t) => t.completed === this.selectedStatus);

    if (this.filterSelectedTags.length > 0) {
      result = result.filter((task) =>
        this.filterSelectedTags.some((ft) =>
          task.tags?.some((tag: Tag) => tag._id === ft._id),
        ),
      );
    }

    return result;
  }

  selectFilterTag(tag: Tag) {
    if (!this.filterSelectedTags.find((t) => t._id === tag._id)) {
      this.filterSelectedTags.push(tag);
    }

    this.filterTagSearch = tag.name;

    this.filterFilteredTags = [];
    this.openFilter = false;
  }

  removeFilterTag(tag: Tag) {
    this.filterSelectedTags = this.filterSelectedTags.filter(
      (t) => t._id !== tag._id,
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  deleteAllTasks() {
    this.taskService.deleteAllTasks().subscribe(() => {
      this.tasks = [];
    });
  }

  goToTags() {
    this.router.navigate(['/tags']);
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

  closeFilterDelayed() {
    setTimeout(() => {
      this.openFilter = false;
    }, 200);
  }

  closeTaskFilterDelayed(task: any) {
    setTimeout(() => {
      if (!task.keepOpen) {
        task.openFilter = false;
      }
      task.keepOpen = false;
    }, 150);
  }

  logout() {
    this.selectedStatus = 'pendiente';
    this.authService.logout();
    this.newTaskTitle = '';
    this.selectedFile = null;
    this.filterTagSearch = '';
    this.filterFilteredTags = [];
    this.filterSelectedTags = [];
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
}
