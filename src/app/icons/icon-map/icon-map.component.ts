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

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IconService } from '../icon.service';
import { SubSink } from 'subsink';
import { SvgIcon } from '../../services/svg-icon';
import { MarkerWrapper } from '../../common/marker-wrapper';

@Component({
  selector: 'app-icon-map',
  template: '<div #mapContainer id="map"></div>',
  styles: [`#map {
    height: 120px;
    width: 100%;
    margin-bottom: 8px;
  }`]
})
export class IconMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private static markerLat = 33.7;
  private static markerLng = -117.7;
  private static centerLoc = new google.maps.LatLng(IconMapComponent.markerLat, IconMapComponent.markerLng);
  private static iconLoc = new google.maps.LatLng(IconMapComponent.markerLat - 0.04, IconMapComponent.markerLng);

  private static mapOptions: google.maps.MapOptions = {
    center: IconMapComponent.centerLoc,
    clickableIcons: false,
    draggable: true,
    controlSize: 1,
    disableDoubleClickZoom: false,
    keyboardShortcuts: false,
    mapTypeControl: false,
    panControl: false,
    rotateControl: false,
    scaleControl: false,
    scrollwheel: false,
    streetViewControl: false,
    zoom: 10
  };

  @ViewChild('mapContainer') gmap: ElementRef;
  private map: google.maps.Map;
  private marker: MarkerWrapper = null;

  private subSink = new SubSink();

  constructor(private iconService: IconService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.map = new google.maps.Map(this.gmap.nativeElement, IconMapComponent.mapOptions);

    // Reacts to an icon having been updated
    this.subSink.sink = this.iconService.iconChanged$.subscribe((svgIcon: SvgIcon) => {
      if (!!this.marker) {
        this.marker.setMap(null);
      }

      if (!!svgIcon) {
        if (svgIcon.hasTextContent()) {
          const text = svgIcon.getTextContent().trim();
          if (text.length > 1) {
            svgIcon.setTextContent(svgIcon.getTextContent());
          }
        }

        this.marker = new MarkerWrapper();
        this.marker.setIsOverlay(svgIcon.isOverlay());
        this.marker.setIcon(svgIcon.serialize());
        this.marker.setPosition(IconMapComponent.iconLoc);
        this.marker.setIconDimensions(svgIcon.getCurrentWidth(), svgIcon.getCurrentHeight());
        this.marker.setMap(this.map);
      } else {
        this.marker.setMap(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
