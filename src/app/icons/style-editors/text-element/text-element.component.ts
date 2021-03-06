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
import { SubSink } from 'subsink';
import { IconService } from '../../icon.service';
import { ElementStyling } from '../../classes/element-styling';

@Component({
  selector: 'app-text-element',
  templateUrl: './text-element.component.html',
  styleUrls: ['./text-element.component.css']
})
export class TextElementComponent implements OnInit, OnDestroy, AfterViewInit {
  public styleForm: FormGroup;

  private elementStyling: ElementStyling;
  private subSink = new SubSink();
  private element: Element;

  constructor(private iconService: IconService,
              private fb: FormBuilder) {
    this.styleForm = this.fb.group({
      fillColor: [],
      fillOpacity: [],
      fontSize: [],
      fontWeight: [],
      text: []
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Reacts to an element style attribute having been selected
    this.subSink.sink = this.iconService.iconTextSelected$.subscribe((element: Element) => {
      this.element = element;
      if (!!element) {
        this.elementStyling = new ElementStyling(element.getAttribute('style'));
        const styleMap = this.elementStyling.getStyleMap();
        this.styleForm.patchValue({
          fillColor: styleMap.get('fill'),
          fillOpacity: styleMap.get('fill-opacity') ? styleMap.get('fill-opacity') : 1,
          fontSize: styleMap.get('font-size'),
          fontWeight: styleMap.get('font-weight'),
          text: element.innerHTML.trim()
        }, {emitEvent: false});
      }
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  public onFillColorChange({target}): void {
    this.elementStyling.setStyleItem('fill', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onFillOpacityChange({target}): void {
    this.elementStyling.setStyleItem('fill-opacity', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onFontSizeChange({target}): void {
    console.dir(target.value);
    this.elementStyling.setStyleItem('font-size', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onFontWeightChange({target}): void {
    console.dir(target.value);
    this.elementStyling.setStyleItem('font-weight', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onTextChange({target}): void {
    this.iconService.textChanged.next(target.value);
  }
}
