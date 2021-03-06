// Copyright (c) 2021 Lars Hellgren (lars@exelor.com).
// All rights reserved.
//
// This code is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-msg-dialog',
  template: `
    <div fxLayoutAlign="space-around" class="title" mat-dialog-title innerHTML="{{data.title}}"></div>
    <div class="msg" mat-dialog-content innerHTML="{{data.msg}}"></div>
    <a href="#"></a>
    <mat-dialog-actions fxLayoutAlign="space-around">
      <button mat-button [mat-dialog-close]="true">{{data.ok}}</button>
    </mat-dialog-actions>`,
  styles: [`
    .title {
      font-size: large;
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
    }
  `]
})
export class MsgDlgComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
  }

}
