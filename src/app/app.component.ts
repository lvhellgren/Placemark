// Copyright (c) 2020 Lars Hellgren (lars@exelor.com).
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

import { Component } from '@angular/core';
import { MsgDlgComponent } from './msg-dlg/msg-dlg.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private static title = 'Placemark';
  private static msg = `
        This Angular application shows how customizable SVG icons can be used in Google Maps markers.
        <div>&nbsp;</div>
        <ul>
            <li><b>PLACES</b> uses SVG icons to mark places on a map.
            <li><b>ICONS</b> customizes SVG icons for use on the PLACES page.
        </ul>
        <p>Created by lars@exelor.com</p>
        `;
  constructor(private dialog: MatDialog) {
  }

  public onInfoBtnClick(): void {
    this.dialog.open(MsgDlgComponent, {
      data: {
        title: AppComponent.title,
        msg: AppComponent.msg,
        ok: 'DISMISS'
      }
    });
  }
}
