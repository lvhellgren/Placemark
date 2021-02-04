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
import { IconService } from '../../icon.service';
import { SubSink } from 'subsink';
import { ElementStyling } from '../../classes/element-styling';

@Component({
  selector: 'app-exelor-image',
  templateUrl: './exelor-image.component.html',
  styleUrls: ['./exelor-image.component.css']
})
export class ExelorImageComponent implements OnInit, OnDestroy, AfterViewInit {
  public styleForm: FormGroup;

  private element: SVGImageElement;
  private elementStyling: ElementStyling;
  private subSink = new SubSink();

  constructor(private iconService: IconService,
              private fb: FormBuilder) {
    this.styleForm = this.fb.group({
      image: [],
      x: [],
      y: [],
      width: [],
      height: []
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Reacts to an element style attribute having been selected
    this.subSink.sink = this.iconService.iconImageSelected$.subscribe((element: SVGImageElement) => {
      this.element = element;
      if (!!element) {
        this.elementStyling = new ElementStyling(element.getAttribute('style'));
        const styleMap = this.elementStyling.getStyleMap();
        this.styleForm.patchValue({
          image: this.element.getAttribute('xlink:href'),
          x: styleMap.get('x'),
          y: styleMap.get('y'),
          width: styleMap.get('width'),
          height: styleMap.get('height')
        }, {emitEvent: false});
      }
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  public onImageChange({target}): void {
    this.element.setAttribute('xlink:href', target.value);
    this.iconService.styleChanged.next();
    console.dir(target.value);
  }

  public onXChange({target}): void {
    this.elementStyling.setStyleItem('x', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onYChange({target}): void {
    this.elementStyling.setStyleItem('y', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onWidthChange({target}): void {
    this.elementStyling.setStyleItem('width', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onHeightChange({target}): void {
    this.elementStyling.setStyleItem('height', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }
}
