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

import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../environments/environment';
import { InfoDlgComponent } from './common/info-dlg/info-dlg.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private static title = 'Placemark';
  private static msg = `
        <h4><b>ICON EDITOR</b></h4>
        <p>Application for creating customized <i>SVG</i> icons.</p>
        The customizable icons are based on template sets where
        properties such as icon text content, icon size, <i>SVG path</i> and <i>stroke</i> colors, and image content can be modified.
        The templates come from the following sources:
        <ul>
            <li><b>Exelor</b> - Icons specially created for this application</li>
            <li><b>Font Awesome</b> - Free icons provided by <i>Font Awesome</i></li>
            <li><b>Mapkey</b> - Free icons provided by <i>mapshakers</i></li>
        </ul>
        <p>To create a custom icon, first select an icon set and an icon from that set in the <i>Icon Template</i> panel. You can then specify scale
        and <i>SVG</i> tag style settings in the <i>Icon Styling</i> panel.</p>

        <p>Icons holding text content have an <i>SVG text</i> tag for specifying the text value.</p>

        <p>The <i>Font Awesome</i> droplet icon has an <i>SVG svg</i> tag for specifying the <i>Font Awesome</i> icon to include.</p>

        <p>Customized icons are stored in sets.</p>

        <p>To save a new icon, either select in existing set or specify a new set name in the <i>Customized Icon</i> panel. Then, enter a name for
        the new icon and click the <b>SAVE</b> button. <b>Note that this demo application saves the icons in <i>localstorage</i> only</b>,
        so the icons are available only to applications running in the browser.</p>

        <p>To edit an already created custom icon, select set name and icon name in the <i>Customized Icon</i> panel and apply the changes in
        the <i>Icon Styling</i> panel before saving.</p>
        <div>&nbsp;</div>

        <h4><b>PLACE MARKER</b></h4>
        <p>Sample application for marking map locations with either previously created and saved custom icons or icons
        from the template sets available in a directory on the server.</p>
        <p>Start out by marking a specific map location by either
        <ul>
            <li>Double clicking on the desired map location</li>
            <li>Entering the location address in the <i>Address </i>field</li>
            <li>Entering the location coordinates in the <i>Latitude</i> and <i>Longitude</i> fields.</li>
        </ul>
        <p>Once latitude and longitude have been established, marker icon and other marker properties can be specified. Use the <i>Custom
        Icon Set</i> checkbox to toggle between your previously created custom icons and server template icons.</p>
        <p>In order to save the place in <i>localstorage</i> (for now) the <i>Name</i> must be specified. Use the <i>Lookup Place</i> to search
        for places sharing the same name.</p>
        <p>Geofences can be defined for the place once the place name is assigned.</p>
        </p>

        `;
  public version: string = environment.VERSION;

  constructor(private dialog: MatDialog) {
  }

  public onInfoBtnClick(): void {
    this.dialog.open(InfoDlgComponent, {
      data: {
        title: AppComponent.title,
        subtitle: `Version: ${this.version}`,
        msg: AppComponent.msg,
        endMsg: `Copyright (c) 2021 Lars Hellgren (lars@exelor.com)`,
        ok: 'DISMISS'
      }
    });
  }
}
