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

import Marker = google.maps.Marker;
import LatLng = google.maps.LatLng;
import { OverlayMarker } from './overlay-marker';


export class MarkerWrapper {
  private overlay = false;
  private marker: Marker | OverlayMarker;

  constructor() {
    this.marker = new google.maps.Marker();
  }

  public getId(): string {
    return this.getPosition().toString();
  }

  public getPosition(): LatLng {
    return this.marker.getPosition();
  }

  public getMarkerImpl(): Marker | OverlayMarker {
    return this.marker;
  }

  public setIsOverlay(isOverlay: boolean): void {
    this.overlay = isOverlay;
    this.marker = isOverlay ? new OverlayMarker() : new google.maps.Marker();
  }

  public isOverlay(): boolean {
    return this.overlay;
  }

  public getIcon(): string {
    let icon: string = null;
    if (this.overlay) {
      icon = (this.marker as OverlayMarker).getSvg();
    } else if (!!(this.marker as Marker).getIcon()) {
      const URL = 'url';
      const url = (this.marker as Marker).getIcon()[URL];
      const offset = url.indexOf('<svg');
      icon = url.substring(offset);
    }
    return icon;
  }

  public setIcon(svgText: string): void {
    if (!!svgText) {
      if (this.overlay) {
        (this.marker as OverlayMarker).setIcon(svgText);
      } else {
        const prefix = svgText.startsWith('data') ? '' : 'data:image/svg+xml;utf-8, ';
        (this.marker as Marker).setIcon({url: prefix + svgText});
      }
    }
  }

  public setIconDimensions(width: number, height: number): void {
    if (this.overlay) {
      (this.marker as OverlayMarker).setIconDimensions(width, height);
    }
  }

  public getIconWidth(): number {
    return this.overlay ? (this.marker as OverlayMarker).getIconWidth() : null;
  }

  public getIconHeight(): number {
    return this.overlay ? (this.marker as OverlayMarker).getIconHeight() : null;
  }

  public setPosition(position: LatLng): void {
    this.marker.setPosition(position);
  }

  public setTitle(title: string): void {
    this.marker.setTitle(title);
  }

  public getTitle(): void {
    this.marker.getTitle();
  }

  addListener(event: string, handler = ($event: Event) => {}): void {
    if (this.overlay) {
      (this.marker as OverlayMarker).addEventHandler(event, handler);
    } else {
      (this.marker as Marker).addListener(event, handler);
    }
  }

  public bounce(): void {
    if (this.overlay) {
      (this.marker as OverlayMarker).bounce(4, -40);
    } else {
      (this.marker as Marker).setAnimation(1);
      setTimeout(() => {
        (this.marker as Marker).setAnimation(null);
      }, 3000);
    }
  }

  public addMarkerDescriptions(infoWindowContent: string, map: google.maps.Map): void {
    if (!!infoWindowContent) {
      if (!this.overlay) {
        (this.marker as Marker).addListener('click', () => {
          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
          });
          infoWindow.open(map, this.marker as Marker);
        });
      } else {
        (this.marker as OverlayMarker).addEventHandler('click', () => {
          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
          });
          infoWindow.open(map, this.marker as OverlayMarker);
        });
      }
    }
  }

  public setMap(map: google.maps.Map, svgId?): void {
    if (this.overlay) {
      (this.marker as OverlayMarker).setMap(map);
    } else {
      (this.marker as google.maps.Marker).setMap(map);
    }
  }
}
