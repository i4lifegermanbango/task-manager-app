import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-error-create-tag',
  templateUrl: './error-create-tag.component.html',
  styleUrls: ['./error-create-tag.component.scss'],
  standalone: false,
})
export class ErrorCreateTagComponent implements OnInit {
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}
}
