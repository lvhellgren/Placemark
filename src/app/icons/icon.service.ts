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

import { Injectable } from '@angular/core';
import {
  AWESOME_ICONS,
  EXELOR_ICON_SET,
  EXELOR_ICONS,
  FONT_AWESOME_ICON_SET,
  MAPKEY_ICON_SET,
  MAPKEY_ICONS,
  TemplateIconStoreService
} from '../services/template-icon-store.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { SvgIcon } from '../services/svg-icon';
import { CustomIconStoreService } from '../services/custom-icon-store.service';

export const ICON_TEPLATE_SETS = [
  {name: 'Exelor', collection: EXELOR_ICONS, setId: EXELOR_ICON_SET},
  {name: 'Font Awesome', collection: AWESOME_ICONS, setId: FONT_AWESOME_ICON_SET},
  {name: 'Mapkey', collection: MAPKEY_ICONS, setId: MAPKEY_ICON_SET},
];

@Injectable({
  providedIn: 'root'
})
export class IconService {
  // Informs observers that a new icon is available for display
  public iconChanged = new Subject<SvgIcon>();
  public iconChanged$ = this.iconChanged.asObservable();

  // Informs observers that an element style attribute has been changed
  public styleChanged = new Subject();
  public styleChanged$ = this.styleChanged.asObservable();

  // Informs observers that a text element value has been changed
  public textChanged = new Subject<string>();
  public textChanged$ = this.textChanged.asObservable();

  // Informs observers that an icon path element is selected for styling
  public iconPathSelected = new BehaviorSubject<Element>(null);
  public iconPathSelected$ = this.iconPathSelected.asObservable();

  // Informs observers that an icon text element is selected for styling
  public iconTextSelected = new BehaviorSubject<Element>(null);
  public iconTextSelected$ = this.iconTextSelected.asObservable();

  // Informs observers that an icon svg element is selected for styling
  public iconSvgSelected = new BehaviorSubject<Element>(null);
  public iconSvgSelected$ = this.iconSvgSelected.asObservable();

  constructor(private templateIconStoreService: TemplateIconStoreService,
              private customIconStoreService: CustomIconStoreService) {
  }

  public loadIcon(iconSet: string, iconName: string, isTemplate: boolean, responseHandler = (svg) => {}): void {
    if (!!iconName) {
      if (isTemplate) {
        this.templateIconStoreService.loadIcon(iconSet, iconName, responseHandler);
      } else {
        this.customIconStoreService.loadIcon(iconSet, iconName, responseHandler);
      }
    }
  }

  public saveIcon(iconSet: string, iconName: string, svg: string, responseHandler = (success: boolean) => {}): void {
    this.customIconStoreService.storeIcon(iconSet, iconName, svg, responseHandler);
  }

  public deleteIcon(iconSet: string, iconName: string, responseHandler = (success: boolean) => {}): void {
    this.customIconStoreService.deleteIcon(iconSet, iconName, responseHandler);
  }
}
