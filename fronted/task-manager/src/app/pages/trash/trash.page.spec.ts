import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrashPage } from './trash.page';

describe('TrashPage', () => {
  let component: TrashPage;
  let fixture: ComponentFixture<TrashPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrashPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
