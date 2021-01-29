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

import { SubSink } from 'subsink';
import { Injectable, OnDestroy } from '@angular/core';

export interface IconSet {
  name: string;
  collection: {
    name: string;
    id: string;
  }[];
  setId: string;
}

export const AWESOME_ICONS = [
  {name: '', id: ''},
  {name: 'Droplet', id: 'droplet'}
];

export const EXELOR_ICONS = [
  {name: '', id: ''},
  {name: 'Image Droplet', id: 'image-droplet'},
  {name: 'Text Box', id: 'text-box'},
  {name: 'Text Droplet', id: 'text-droplet'}
];

export const MAPKEY_ICONS = [
  {name: '', id: ''},
  {name: 'Airport', id: 'airport'},
  {name: 'Bar', id: 'bar'},
  {name: 'Beach', id: 'beach'},
  {name: 'Building', id: 'building'},
  {name: 'Burger', id: 'burger'},
  {name: 'Cemetery', id: 'cemetery'},
  {name: 'Chapel', id: 'chapel'},
  {name: 'Cinema', id: 'cinema'},
  {name: 'City', id: 'city'},
  {name: 'City Hall', id: 'city_hall'},
  {name: 'Construction', id: 'construction'},
  {name: 'Contour', id: 'contour'},
  {name: 'Court House', id: 'court_house'},
  {name: 'Dentist', id: 'dentist'},
  {name: 'Fuel', id: 'fuel'},
  {name: 'Golf', id: 'golf'},
  {name: 'Home', id: 'home'},
  {name: 'Hotel', id: 'hotel'},
  {name: 'Island', id: 'island'},
  {name: 'Mall', id: 'mall'},
  {name: 'Market Place', id: 'market_place'},
  {name: 'Mine', id: 'mine'},
  {name: 'Museum', id: 'museum'},
  {name: 'Parking', id: 'parking'},
  {name: 'Police', id: 'police'},
  {name: 'Post Office', id: 'post_office'},
  {name: 'Sailboat', id: 'sailboat'},
  {name: 'School', id: 'school'},
  {name: 'Stadium', id: 'stadium'},
  {name: 'Theatre', id: 'theatre'},
  {name: 'University', id: 'university'},
  {name: 'Viewpoint', id: 'viewpoint'},
  {name: 'Village', id: 'village'},
  {name: 'Water Tower', id: 'water_tower'},
  {name: 'Water Park', id: 'waterpark'},
  {name: 'Wind Generator', id: 'wind_generator'},
  {name: 'Zoo', id: 'zoo'},
];

export const FONT_AWESOME_ICON_SET = 'font-awesome-icons';
export const EXELOR_ICON_SET = 'exelor-icons';
export const MAPKEY_ICON_SET = 'mapkey-icons';

@Injectable({
  providedIn: 'root'
})
export class TemplateIconStoreService implements OnDestroy {
  private static readonly iconDir = '/assets/';

  private subSink = new SubSink();

  constructor() {
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * Loads SVG icon from a server directory location
   */
  public loadIcon(iconSetId: string, iconId: string, responseHandler = (svg) => {}): void {
    const xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.open('GET', `${TemplateIconStoreService.iconDir}/${iconSetId}/${iconId}.svg`, true);
    xmlHttpRequest.onload = () => {
      const response = xmlHttpRequest.response;
      if (!!!response) {
        throw Error('Could not load file');
      } else if (!response.startsWith('<?xml')) {
        throw Error('Missing or invalid SVG file');
      }
      responseHandler(response);
    };

    xmlHttpRequest.onerror = (err) => {
      throw Error('Could not load file:' + err);
    };

    xmlHttpRequest.send();
  }
}
