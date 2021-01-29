import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-info-dlg',
  template: `
    <div fxLayoutAlign="space-around" class="title" mat-dialog-title innerHTML="{{data.title}}"></div>
    <div fxLayoutAlign="space-around" class="subtitle" mat-dialog-title innerHTML="{{data.subtitle}}"></div>
    <div class="msg" mat-dialog-content innerHTML="{{data.msg}}"></div>
    <a href="#"></a>
    <mat-dialog-actions fxLayoutAlign="space-around">
      <button mat-button [mat-dialog-close]="true">{{data.ok}}</button>
    </mat-dialog-actions>
    <div class="subtitle" mat-dialog-content innerHTML="{{data.endMsg}}"></div>
  `,

  styles: [`
    .title {
      font-size: large;
      color: gray;
      margin: 0;
    }

    .subtitle {
      font-size: small;
      color: gray;
    }

    .msg {
      font-size: medium;
      color: gray;
    }

    button {
      flex-basis: 80px;
      border-radius: .25rem;
      color: white;
      background-color: #3f51b5;
      margin-bottom: 20px;
    }
  `]
})
export class InfoDlgComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
  }
}
