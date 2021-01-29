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

import { MarkerWrapper } from '../../common/marker-wrapper';
import { PlaceModel } from '../../services/place-store.service';
import { SvgIcon } from '../../services/svg-icon';
import LatLng = google.maps.LatLng;


export interface Geofence {
  id: string;
  radius?: number;
  visible?: boolean;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
}

export class MapFence extends google.maps.Circle {
  fenceId: string;

  constructor(fenceId: string, opts: {}) {
    super(opts);
    this.fenceId = fenceId;
  }
}

export class Place {
  private name?: string;
  private isCustomIconSet = false;
  marker?: MarkerWrapper;
  address?: string;
  hasIconTextContent = false;
  iconTextContent?: string;
  infoWindowContent?: string;
  private fences?: Map<string, Geofence>;

  private iconSetId?: string;
  private iconId?: string;

  // UI controls
  private hasChanged = false;
  private saved = false;
  recenter = false;

  constructor(private position: LatLng) {
    this.marker = new MarkerWrapper();
    this.marker.setPosition(this.position);
  }

  static makePlaceId(position: LatLng): string {
    return !!position ? (position.lat().toString() + '/' + position.lng().toString()) : null;
  }

  public setName(name): void {
    this.name = name;
    this.hasChanged = true;
  }

  public getName(): string {
    return this.name;
  }

  public setIsCustomIconSet(value: boolean): void {
    this.isCustomIconSet = value;
  }

  public getIsCustomIconSet(): boolean {
    return this.isCustomIconSet;
  }

  public getIconSetId(): string {
    return this.iconSetId;
  }

  public setIconSetId(iconSetId: string): void {
    this.iconSetId = iconSetId;
  }

  public getIconId(): string {
    return this.iconId;
  }

  public setIconId(iconId: string): void {
    this.iconId = iconId;
    this.hasChanged = true;
  }

  public setIconTextContent(content: string): void {
    this.iconTextContent = content;
    this.hasChanged = true;
  }

  public setInfoWindowContent(content: string): void {
    this.infoWindowContent = content;
    this.hasChanged = true;
  }

  public setMarker(svgIcon: SvgIcon): void {
    this.marker = new MarkerWrapper();
    if (!!svgIcon) {
      this.marker.setIsOverlay(svgIcon.isOverlay());
      this.marker.setIcon(svgIcon.serialize());
      this.marker.setIconDimensions(svgIcon.getCurrentWidth(), svgIcon.getCurrentHeight());
      this.hasIconTextContent = svgIcon.hasTextContent();
      if (this.hasIconTextContent) {
        this.iconTextContent = svgIcon.getTextContent().trim();
      }
    } else {
      this.hasIconTextContent = false;
      this.iconTextContent = null;
    }
    this.marker.setPosition(this.position);
  }

  public addMarkerDescriptions(map: google.maps.Map): void {
    if (this.marker) {
      this.marker.addMarkerDescriptions(this.infoWindowContent, map);
      this.marker.setTitle(this.name);
    }
  }

  public setFence(fenceId: string, geofence: Geofence): void {
    if (!!!this.fences) {
      this.fences = new Map<string, Geofence>();
    }
    this.fences.set(fenceId, geofence);
    this.hasChanged = true;
  }

  public getFenceIds(): string[] {
    return !!this.fences && this.fences.size > 0 ? Array.from(this.fences.keys()) : [];
  }

  public getFences(): Map<string, Geofence> {
    return this.fences;
  }

  public getFence(id: string): Geofence {
    return this.fences.get(id);
  }

  public deleteFence(id: string): void {
    this.fences.delete(id);
    this.hasChanged = true;
  }

  public insertModel(model: PlaceModel): Place {
    this.name = model.name;
    this.isCustomIconSet = model.isCustomIconSet;
    this.address = model.address;
    this.iconTextContent = model.textContent;
    this.hasIconTextContent = !!model.textContent;
    this.infoWindowContent = model.infoWindowContent;
    this.position = new LatLng(model.latitude, model.longitude);
    this.insertFences(model.fences);
    this.iconSetId = model.iconSetId;
    this.iconId = model.iconId;
    this.marker.setIcon(model.svgText);
    return this;
  }

  private insertFences(fences: Map<string, Geofence>): void {
    this.fences = fences;
  }

  getModel(): PlaceModel {
    const model: PlaceModel = {
      name: this.name,
      isCustomIconSet: this.isCustomIconSet,
      address: this.address,
      latitude: this.position.lat(),
      longitude: this.position.lng(),
      fences: this.fences,
      textContent: this.iconTextContent,
      infoWindowContent: this.infoWindowContent,
      iconSetId: this.iconSetId,
      iconId: this.iconId,
      isOverLayMarker: this.marker.isOverlay(),
      iconWidth: this.marker.getIconWidth(),
      iconHeight: this.marker.getIconHeight(),
      svgText: this.marker.getIcon() as string
    };
    return {...model};
  }

  public getPosition(): LatLng {
    return this.position;
  }

  public getPositionId(): string {
    return !!this.position ? Place.makePlaceId(this.getPosition()) : null;
  }

  public getId(): string {
    return this.getPositionId();
  }

  // Checks if a place shares the location spot of this place.
  public isSameSpot(place: Place): boolean {
    return place.getId() === this.getId();
  }

  public isSaved(value: boolean = null): boolean {
    if (value !== null) {
      this.saved = value;
      this.hasChanged = false;
    }
    return this.saved;
  }

  public needsSaving(): boolean {
    return this.hasChanged && !!this.position && !!this.name;
  }
}
