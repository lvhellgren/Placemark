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

import Marker = google.maps.Marker;
import LatLng = google.maps.LatLng;
import { OverlayMarker } from './overlay-marker';


export const  CLICK = 'click';
export const  DBLCLICK = 'dblclick';
export const  MOUSEOVER = 'mouseover';

export class MarkerWrapper {
  private readonly marker: Marker;
  private readonly overlayMarker: OverlayMarker;

  constructor(marker: Marker | OverlayMarker) {
    if (marker instanceof Marker) {
      this.marker = marker;
    } else {
      this.overlayMarker = marker;
    }
  }

  public getId(): string {
    return this.getPosition().toString();
  }

  public getPosition(): LatLng {
    return !!this.marker ? this.marker.getPosition() : this.overlayMarker.getPosition();
  }

  public getMarkerImpl(): Marker | OverlayMarker {
    return !!this.marker ? this.marker : this.overlayMarker;
  }

  public getIcon(): string {
    const URL = 'url';
    console.dir(this.marker);
    if (!!this.marker) {
      const url = this.marker.getIcon()[URL];
      const offset = url.indexOf('<svg');
      return url.substring(offset);
    } else {
      return this.overlayMarker.getSvg();
    }
  }

  public setIcon(svgIcon: string): void {
    if (!!svgIcon) {
      !!this.marker ? this.marker.setIcon({url: 'data:image/svg+xml;utf-8, ' + svgIcon}) : this.overlayMarker.setIcon(svgIcon);
    }
  }

  public setPosition(position: LatLng): void {
    !!this.marker ? this.marker.setPosition(position) : this.overlayMarker.setPosition(position);
  }

  public setTitle(title: string): void {
    !!this.marker ? this.marker.setTitle(title) : this.overlayMarker.setTitle(title);
  }

  public getTitle(title: string): void {
    !!this.marker ? this.marker.getTitle() : this.overlayMarker.getTitle();
  }

  addListener(event: string, handler = ($event: Event) => {}): void {
    if (this.marker) {
      this.marker.addListener(event, handler);
    } else {
      this.overlayMarker.eventHandlers.set(event, handler);
    }
  }

  public bounce(): void {
    if (this.marker) {
      this.marker.setAnimation(1);
      setTimeout(() => {
        this.marker.setAnimation(null);
      }, 3000);
    } else {
      this.overlayMarker.bounce(4, -40);
    }
  }

  addMarkerDescriptions(infoWindowContent: string, map: google.maps.Map): void {
    if (!!infoWindowContent) {
      if (this.marker) {
        this.marker.addListener('click', (event: Event) => {
          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
          });
          infoWindow.open(map, this.marker);
        });
      }
    }
  }

  public setMap(map: google.maps.Map, svgId?): void {
    if (this.marker) {
      this.marker.setMap(map);
    } else {
      this.overlayMarker.setMap(map);

      if (!!map) {
        setTimeout(() => {
          const svgElement = document.getElementById(svgId);
          if (!!svgElement) {
            const pathBox = (svgElement as unknown as SVGGraphicsElement).getBoundingClientRect();
            this.overlayMarker.adjustDiv(pathBox.width, pathBox.height);
          }
        }, 100);
      }
    }
  }
}
