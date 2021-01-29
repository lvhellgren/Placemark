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
import { SubSink } from 'subsink';
import { IconService } from '../../icon.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ElementStyling } from '../../classes/element-styling';

@Component({
  selector: 'app-path-element',
  templateUrl: './path-element.component.html',
  styleUrls: ['./path-element.component.css']
})
export class PathElementComponent implements OnInit, OnDestroy, AfterViewInit {
  public styleForm: FormGroup;

  private elementStyling: ElementStyling;
  private subSink = new SubSink();
  private element: Element;

  constructor(private iconService: IconService,
              private fb: FormBuilder) {
    this.styleForm = this.fb.group({
      fillColor: [],
      fillOpacity: [],
      strokeColor: [],
      strokeOpacity: [],
      strokeWidth: []
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Reacts to an element style attribute having been selected
    this.subSink.sink = this.iconService.iconPathSelected$.subscribe((element: Element) => {
      this.element = element;
      if (!!element) {
        this.elementStyling = new ElementStyling(element.getAttribute('style'));
        const styleMap = this.elementStyling.getStyleMap();
        this.styleForm.patchValue({
          fillColor: styleMap.get('fill'),
          fillOpacity: styleMap.get('fill-opacity') ? styleMap.get('fill-opacity') : 1,
          strokeColor: styleMap.get('stroke'),
          strokeOpacity: styleMap.get('stroke-opacity') ? styleMap.get('stroke-opacity') : 1,
          strokeWidth: styleMap.get('stroke-width') ? styleMap.get('stroke-width') : 1,
        }, {emitEvent: false});

        this.highLight(element, 6, true);
      }
    });
  }

  private highLight(element: Element, count: number, hide: boolean): void {
    setTimeout(() => {
      const value: string = hide ? 'hidden' : 'visible';
      element.setAttribute('visibility', value);
      this.iconService.styleChanged.next();
      if (count-- > 0) {
        this.highLight(element, count, !hide);
      } else {
        element.setAttribute('visibility', 'visible');
        this.iconService.styleChanged.next();
      }
    }, hide ? 1000 : 500);
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

  public onStrokeColorChange({target}): void {
    this.elementStyling.setStyleItem('stroke', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onStrokeOpacityChange({target}): void {
    this.elementStyling.setStyleItem('stroke-opacity', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }

  public onStrokeWidthChange({target}): void {
    this.elementStyling.setStyleItem('stroke-width', target.value);
    this.element.setAttribute('style', this.elementStyling.getStyle());
    this.iconService.styleChanged.next();
  }
}
