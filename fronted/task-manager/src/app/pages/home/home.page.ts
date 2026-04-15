import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TagService, Tag } from '../../services/tag.service';

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

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private tagService: TagService,
  ) {}

  ngOnInit(): void {}

  ionViewWillEnter() {
    this.rol = this.authService.getRol() || '';
    this.loadTasks();
    this.loadTags();
  }

  filterTagsGlobal() {
    this.filterFilteredTags = this.filterTagsLogic(
      this.filterTagSearch,
      this.allTags,
    );
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

  deleteTask(task: Task) {
    this.taskService.deleteTask(task._id!).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t._id !== task._id);
    });
  }

  filterTags(task: any) {
    task.filteredTags = this.filterTagsLogic(task.tagSearch, this.allTags);
  }

  selectTag(task: any, tag: Tag) {
    if (!task.selectedTags.find((t: Tag) => t._id === tag._id)) {
      task.selectedTags.push(tag);
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
        this.taskService.addTagToTask(task._id!, tagId).subscribe();
      }
    });

    currentTagIds.forEach((tagId: string) => {
      if (!newTagIds.includes(tagId)) {
        this.taskService.removeTagFromTask(task._id!, tagId).subscribe();
      }
    });
  }

  openTask(task: Task) {
    this.selectedTags = [...(task.tags || [])];
  }

  get filteredTasks() {
    let result = this.tasks.filter((t) => t.completed === this.selectedStatus);

    if (this.filterSelectedTags.length > 0) {
      result = result.filter((task) =>
        this.filterSelectedTags.every((ft) =>
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

    this.filterTagSearch = '';
    this.filterFilteredTags = [];
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

  logout() {
    this.selectedStatus = 'pendiente';
    this.authService.logout();
    this.newTaskTitle = '';
    this.selectedFile = null;
    this.filterTagSearch = '';
    this.filterFilteredTags = [];
    this.filterSelectedTags = [];
  }
}
