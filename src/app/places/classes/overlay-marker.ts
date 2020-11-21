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


import OverlayView = google.maps.OverlayView;
import LatLng = google.maps.LatLng;
import { CLICK, DBLCLICK } from './marker-wrapper';

/**
 * Implements map markers as overlays in order to support images in SVG markers.
 */
export class OverlayMarker extends OverlayView {
  div: HTMLElement;
  iconWidth = 0;
  iconHeight = 0;

  eventHandlers: Map<string, any>;

  constructor(private latLng?: LatLng,
              private svg: string = null) {
    super();
    this.eventHandlers = new Map<string, any>();
  }

  public onAdd(): void {
    this.createDiv();
    this.appendDivToOverlay();
    OverlayView.preventMapHitsFrom(this.div);
    this.positionDiv(0);
  }

  public draw(): void {
  }

  public getSvg(): string {
    return this.svg;
  }

  public setIcon(icon: string): void {
    this.svg = icon;
  }

  public setTitle(title: string): void {
    setTimeout(() => {
      this.div.title = title;
    });
  }

  public getTitle(): string {
    return this.div.title;
  }

  public getPosition(): LatLng {
    return this.latLng;
  }

  public setPosition(position: LatLng): void {
    this.latLng = position;
  }

  public addEventHandler(eventName: string, handler = (event) => {
  }): void {
    this.eventHandlers.set(eventName, handler);
  }

  public bounce(bounces: number, height: number): void {
    for (let i = 0; i < bounces; i++) {
      setTimeout(() => {
        this.positionDiv(height);
        setTimeout(() => {
            this.positionDiv(0);
          }, 300
        );
      }, i * 600);
    }
  }

  public adjustDiv(width, height): void {
    this.iconWidth = width;
    this.iconHeight = height;
    this.positionDiv(0);
  }

  private remove(): void {
    if (this.div) {
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }
  }

  private createDiv(): void {
    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.div.style.backgroundColor = '#aaa';
    if (!!this.svg) {
      this.div.innerHTML = this.svg;
    }

    {
      // Implements support of click and dblclick handlers on the enclosing marker overlay div. Handler functions must be
      // stored in the eventHandlers map.
      let tapCount = 0;
      google.maps.event.addDomListener(this.div, CLICK, (() => {
        tapCount++;
        setTimeout(() => {
          if (tapCount === 1) {
            tapCount = 0;
            this.bounce(4, -40);
            this.callHandler(CLICK);
          }
          if (tapCount > 1) {
            tapCount = 0;
            console.dir(this.eventHandlers);
            this.callHandler(DBLCLICK);
          }
        }, 300);
      }));
    }

    // google.maps.event.addDomListener(this.div, MOUSEOVER, (() => {
    //   console.log(MOUSEOVER);
    // }));
  }

  private callHandler(eventName): void {
    const f = this.eventHandlers.get(eventName);
    if (!!f) {
      f();
    } else {
      console.error(`Marker not saved or event handler not specified for ${eventName} event`);
    }
  }

  private appendDivToOverlay(): void {
    const panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div);
  }

  private positionDiv(height: number): void {
    this.div.style.width = `${this.iconWidth + 5}px`;
    this.div.style.height = `${this.iconHeight + 5}px`;

    const point = this.getProjection().fromLatLngToDivPixel(this.latLng);
    if (point) {
      this.div.style.left = `${point.x - this.div.offsetWidth / 2}px`;
      this.div.style.top = `${point.y - (this.div.offsetHeight - height)}px`;
    }
  }

  private getDraggable(): boolean {
    return false;
  }
}
