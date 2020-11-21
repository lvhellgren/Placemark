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

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-icons-map',
  template: '<div #mapContainer id="map"></div>',
  styleUrls: ['./icons-map.component.css']
})
export class IconsMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') private gmap: ElementRef;
  private latitude = 33.632989970769266;
  private longitude = -117.87636384491788;
  private coordinates = new google.maps.LatLng(this.latitude, this.longitude);

  private mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    streetViewControl: true,
    disableDoubleClickZoom: true,
    zoom: 16
  };

  private map: google.maps.Map;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    this.mapOptions.center = new google.maps.LatLng(this.latitude, this.longitude);
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
  }
}
