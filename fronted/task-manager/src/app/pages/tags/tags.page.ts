import { Component, OnInit } from '@angular/core';
import { TagService, Tag } from '../../services/tag.service';
import { Router } from '@angular/router';

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
  ) {}

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.tagService.getTags().subscribe((tags) => {
      this.tags = tags;
    });
  }

  addTag() {
    if (!this.newTagName.trim()) return;

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
