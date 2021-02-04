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

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ICON_TEPLATE_SETS, IconService } from './icon.service';
import { SvgIcon } from '../services/svg-icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDlgComponent } from '../common/error-dlg/error-dlg.component';
import { SubSink } from 'subsink';
import { CustomIconStoreService } from '../services/custom-icon-store.service';
import { MsgDlgComponent } from '../common/msg-dlg/msg-dlg.component';


@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css']
})
export class IconComponent implements OnInit, AfterViewInit, OnDestroy {
  public iconForm: FormGroup;

  public iconTemplateSets: { name: string, collection: { name: string, id: string }[], setId: string }[] = ICON_TEPLATE_SETS;
  public iconTemplateSet: { id: string, name: string }[];
  public selectedIconTemplateSet: string;
  public selectedIconTemplate: string;

  public svgElements: Element[];
  public selectedSvgElement: Element;

  public custIconSets: string[] = [];
  public selectedCustIconSet: string;
  public selectedCustIcon: string;
  public effectiveCustIconSet: string;
  public effectiveCustIcon: string;

  public custIcons: string[];
  public custIcon: string;

  public canCancel: boolean;
  public canDelete: boolean;
  public canSave: boolean;

  private svgIcon: SvgIcon = null;
  private subSink = new SubSink();

  constructor(private iconService: IconService,
              private customIconStoreService: CustomIconStoreService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private router: Router) {
    this.iconForm = this.fb.group({
      iconTemplateSet: [],
      iconTemplate: [],
      scale: [],
      svgElements: [],
      selectedCustIconSet: [],
      effectiveCustIconSet: [],
      selectedCustIcon: [],
      effectiveCustIcon: [],
    });
  }

  ngOnInit(): void {
    this.customIconStoreService.fetchSetNames();

    // Reacts to stored icon sets having been updated
    this.subSink.sink = this.customIconStoreService.iconSetNamesFetched$.subscribe((names: string[]) => {
      if (!!names && names.length > 0) {
        this.custIconSets = names;
        if (!!this.selectedCustIconSet) {
          this.customIconStoreService.fetchSet(this.selectedCustIconSet);
        }
        this.canSave = false;
      } else {
        this.clearCustomIconSet();
      }
    });

    // Reacts to a stored icon set having been updated
    this.subSink.sink = this.customIconStoreService.iconSetFetched$.subscribe((set: string[]) => {
      if (!!set) {
        this.custIcons = set;
      } else {
        this.iconForm.patchValue({
          scale: [],
          effectiveCustIconSet: ''
        }, {emitEvent: false});
      }
    });
  }

  ngAfterViewInit(): void {
    // Reacts to an element style attribute having been updated
    this.subSink.sink = this.iconService.styleChanged$.subscribe(() => {
      this.canCancel = true;
      this.canDelete = false;
      this.canSave = this.canSaveIcon();
      this.iconService.iconChanged.next(this.svgIcon);
    });

    // Reacts to a text element value having been updated
    this.subSink.sink = this.iconService.textChanged$.subscribe((text: string) => {
      this.svgIcon.setTextContent(text);
      this.canCancel = true;
      this.canDelete = false;
      this.canSave = this.canSaveIcon();
      this.iconService.iconChanged.next(this.svgIcon);
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  public onIconTemplateSetChange(source): void {
    this.setIconTemplateSet(source.value);
    this.selectedIconTemplate = '';
  }

  private setIconTemplateSet(setId): void {
    const set = ICON_TEPLATE_SETS.find(iconTemplateSet => iconTemplateSet.setId === setId);
    this.iconTemplateSet = set.collection;
  }

  public onIconTemplateChange(source): void {
    this.loadIcon(this.selectedIconTemplateSet, source.value, true);
    this.clearCustomIcon();
  }

  private loadIcon(iconSet: string, iconName: string, isTemplate: boolean): void {
    this.iconService.loadIcon(iconSet, iconName, isTemplate, (svg: string) => {
      if (!!svg) {
        this.svgIcon = new SvgIcon(svg);
        this.iconForm.get('scale').setValue(this.svgIcon.getCurrentScale(), {emitEvent: false});

        this.svgElements = this.svgIcon.getStyledElements();
        this.iconService.styleChanged.next(this.svgIcon);
        this.router.navigate([`./`], {relativeTo: this.route});
        this.canSave = false;
        this.canCancel = true;
      } else {
        this.dialog.open(ErrorDlgComponent, {
          data: {
            msg: `Unknown icon: ${iconSet}/${iconName}`
          }
        });
      }
    });
  }

  public onSvgTagChange(source): void {
    this.iconForm.get('scale').setValue(this.svgIcon.getCurrentScale(), {emitEvent: false});
    try {
      let route;
      const tag = source.value.nodeName;
      if (tag === 'path' || tag === 'circle') {
        this.iconService.iconPathSelected.next(source.value);
        route = 'path-element';
      } else if (tag === 'text') {
        this.iconService.iconTextSelected.next(source.value);
        route = 'text-element';
      } else if (tag === 'image') {
        this.iconService.iconImageSelected.next(source.value);
        route = 'exelor-image';
      } else if (tag === 'svg') {
        this.iconService.iconSvgSelected.next(source.value);
        route = 'font-awesome';
      }

      if (!!route) {
        this.router.navigate([`./${route}`], {relativeTo: this.route});
      } else {
        this.dialog.open(ErrorDlgComponent, {
          data: {
            msg: `Unknown SVG element tag: ${tag}`
          }
        });
      }
    } catch (e) {
      console.error(e);
      this.dialog.open(ErrorDlgComponent, {
        data: {
          msg: `${e.toString()} (origin: ${this.svgIcon.getOrigin()}, icon-type: ${this.svgIcon.getIconType()})`
        }
      });
    }
  }

  public onCustIconSetChange(source): void {
    this.effectiveCustIconSet = source.value;
    this.iconForm.patchValue({
      effectiveCustIconSet: source.value
    }, {emitEvent: false});

    this.customIconStoreService.fetchSet(source.value);
    this.clearCustomIcon();
  }

  private clearCustomIconSet(): void {
    this.selectedCustIconSet = '';
    this.iconForm.patchValue({
      selectedCustIconSet: '',
      effectiveCustIconSet: ''
    }, {emitEvent: false});

    this.clearCustomIcon();

    this.svgIcon = null;
    this.iconService.styleChanged.next(this.svgIcon);
    this.canDelete = this.canSave = false;
  }

  private clearCustomIcon(): void {
    this.selectedCustIcon = '';
    this.iconForm.patchValue({
      selectedCustIcon: '',
      effectiveCustIcon: ''
    }, {emitEvent: false});
  }

  public onCustIconChange(source): void {
    this.effectiveCustIcon = source.value;
    this.iconForm.patchValue({
      effectiveCustIcon: source.value
    }, {emitEvent: false});
    this.loadIcon(this.selectedCustIconSet, source.value, false);

    this.selectedIconTemplate = ''; // iconTemplate
    this.iconForm.patchValue({
      iconTemplate: ''
    }, {emitEvent: false});

    this.canCancel = true;
    this.canDelete = true;
    this.canSave = false;
  }

  public onScaleChange({target}): void {
    this.svgIcon.setCurrentScale(target.value);
    this.iconService.styleChanged.next(this.svgIcon);
    this.canSave = this.canSaveIcon();
  }

  public onEffectiveCustIconSetChange({target}): void {
    this.effectiveCustIconSet = target.value;
    this.canSave = this.canSaveIcon();
  }

  public onEffectiveCustIconChange({target}): void {
    this.effectiveCustIcon = target.value;
    this.canSave = this.canSaveIcon();
  }

  public onCancel(): void {
    this.svgIcon = null;
    this.iconService.styleChanged.next(this.svgIcon);
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentRoute]);
    });
  }

  public onSave(): void {
    const set = this.iconForm.get('effectiveCustIconSet').value.trim();
    const icon = this.iconForm.get('effectiveCustIcon').value.trim();
    if (set.length > 0 && icon.length > 0) {
      this.iconService.saveIcon(set, icon, this.svgIcon.serialize(), (success: boolean) => {
        if (success) {
          this.clearCustomIcon();
          this.dialog.open(MsgDlgComponent, {
            data: {
              title: 'Success',
              msg: `Icon ${set}/${icon} saved`,
              ok: 'CLOSE'
            }
          });
        } else {
          this.dialog.open(ErrorDlgComponent, {
            data: {
              title: 'Error',
              msg: `Could not save ${set} / ${icon}`,
              ok: 'CLOSE'
            }
          });
        }
      });
    } else {
      this.dialog.open(ErrorDlgComponent, {
        data: {
          msg: `Invalid Set or Icon name`
        }
      });
    }
  }

  public onDelete(): void {
    const set = this.iconForm.get('effectiveCustIconSet').value;
    const icon = this.iconForm.get('effectiveCustIcon').value;
    this.iconService.deleteIcon(set, icon, (success: boolean) => {
        if (success) {
          this.iconForm.patchValue({
            effectiveCustIconSet: this.selectedCustIconSet,
            effectiveCustIcon: ''
          });
          this.iconService.iconChanged.next(null);

          this.dialog.open(MsgDlgComponent, {
            data: {
              title: 'Success',
              msg: `Icon ${set}/${icon} deleted`,
              ok: 'CLOSE'
            }
          });
        } else {
          this.dialog.open(ErrorDlgComponent, {
            data: {
              title: 'Error',
              msg: `Could not delete ${set} / ${icon}`,
              ok: 'CLOSE'
            }
          });
        }
    });
  }

  private canSaveIcon(): boolean {
    return this.canCancel && !!this.effectiveCustIconSet && !!this.effectiveCustIcon && !!this.svgIcon;
  }
}
