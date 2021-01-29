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
import { FontAwesome, ICON_DEFS, IconDef } from './font-awesome';
import { SubSink } from 'subsink';
import { IconService } from '../../icon.service';
import { ElementStyling } from '../../classes/element-styling';

@Component({
  selector: 'app-font-awesome',
  templateUrl: './font-awesome.component.html',
  styleUrls: ['./font-awesome.component.css']
})
export class FontAwesomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private static xCenter = 498;
  private static yCenter = 381;

  public styleForm: FormGroup;
  public selectedIconDef;
  public iconFilter: any;

  public iconDefs: IconDef[] = ICON_DEFS;

  private subSink = new SubSink();
  private svgElement: Element;
  private viewBoxItems: string[];
  private path: Element;
  private elementStyling: ElementStyling;

  constructor(private iconService: IconService,
              private fb: FormBuilder) {
    this.styleForm = this.fb.group({
      selectedIconDef: [],
      color: [],
      iconFilter: [],
      xOffset: [],
      yOffset: [],
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Reacts to Font Awesome icon style having been selected
    this.subSink.sink = this.iconService.iconSvgSelected$.subscribe((element: Element) => {
      this.svgElement = element;
    });

    this.subSink.sink = this.styleForm.controls.iconFilter.valueChanges.subscribe((filter) => {
      this.iconDefs = FontAwesome.filterIcons(filter);
    });

    this.subSink.sink = this.styleForm.controls.xOffset.valueChanges.subscribe((value) => {
      if (!!value) {
        this.viewBoxItems[0] = value.toString();
        this.applyChanges();
      }
    });

    this.subSink.sink = this.styleForm.controls.yOffset.valueChanges.subscribe((value) => {
      if (!!value) {
        this.viewBoxItems[1] = value.toString();
        this.applyChanges();
      }
    });

    this.subSink.sink = this.styleForm.controls.selectedIconDef.valueChanges.subscribe((iconDef: IconDef) => {
      const viewBox = this.svgElement.getAttribute('viewBox');
      this.viewBoxItems = viewBox.split(' ');

      const icon: any[] = iconDef[1].icon;
      this.viewBoxItems[0] = (+icon[0] / 2 - FontAwesomeComponent.xCenter).toString();
      this.viewBoxItems[1] = (FontAwesomeComponent.yCenter - +icon[1] / 2).toString();

      this.path = this.svgElement.getElementsByTagName('path')[0];
      this.elementStyling = new ElementStyling(this.path.getAttribute('style'));

      this.styleForm.patchValue({
        color: this.elementStyling.getStyleMap().get('fill'),
        xOffset: +this.viewBoxItems[0],
        yOffset: +this.viewBoxItems[1],
      }, {emitEvent: false});

      this.path.setAttribute('d', iconDef[1].icon[4].toString());
      this.applyChanges();
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  public onColorChange(event): void {
      this.elementStyling.setStyleItem('fill', event.target.value);
      this.path.setAttribute('style', this.elementStyling.getStyle());
      this.applyChanges();
  }

  private applyChanges(): void {
    this.svgElement.setAttribute('viewBox',
      `${this.viewBoxItems[0]} ${this.viewBoxItems[1]} ${this.viewBoxItems[2]} ${this.viewBoxItems[3]}`);
    this.iconService.styleChanged.next();
  }
}
