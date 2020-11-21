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

import { MarkerWrapper } from './marker-wrapper';
import { OverlayMarker } from './overlay-marker';
import { PlaceModel } from '../../services/data-store.service';
import LatLng = google.maps.LatLng;

export const AWESOME_ICON_SET = 'awesome-icons';
export const EXELOR_OVERLAY_ICON_SET = 'exelor-overlay-icons';
export const MAPKEY_ICON_SET = 'mapkey-icons';

export const ICON_KITS = [];

export const SVG_ID = 'SVG_ID_';

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
  marker?: MarkerWrapper;
  address?: string;
  infoWindowContent: string;
  private fences?: Map<string, Geofence>;

  scale?: number;
  origWidth?: number;
  origHeight?: number;
  iconSetId?: string;
  iconId?: string;

  // UI controls
  isValid = false;
  private touched = false;
  private saved = false;
  recenter = false;

  latitude: number;
  longitude: number;

  constructor(iconSetId = null, iconId = null) {
    this.setMarker(iconSetId, iconId);
  }

  static makeSvgId(position: LatLng): string {
    return !!position ? (SVG_ID + position.lat().toString() + '_' + position.lng().toString()) : null;
  }

  static makePlaceId(lat: number, lng: number): string {
    return lat + '/' + lng;
  }

  public setName(name): void {
    this.name = name;
    this.touched = true;
  }

  public getName(): string {
    return this.name;
  }

  public setInfoWindowContent(content: string): void {
    this.infoWindowContent = content;
    this.touched = true;
  }

  private setMarker(iconSetId: string, iconId: string): void {
    this.iconSetId = iconSetId;
    this.iconId = iconId;
    if (!!iconSetId && (iconSetId === AWESOME_ICON_SET || iconSetId === EXELOR_OVERLAY_ICON_SET)) {
      this.marker = new MarkerWrapper(new OverlayMarker());
    } else {
      this.marker = new MarkerWrapper(new google.maps.Marker());
    }
    this.marker.setPosition(new LatLng(this.latitude, this.longitude));
  }

  public setFence(fenceId: string, geofence: Geofence): void {
    if (!!!this.fences) {
      this.fences = new Map<string, Geofence>();
    }
    this.fences.set(fenceId, geofence);
    this.touched = true;
  }

  public getFenceIds(): string[] {
    return !!this.fences ? Array.from(this.fences.keys()) : [];
  }

  public getFences(): Map<string, Geofence> {
    return this.fences;
  }

  public getFence(id: string): Geofence {
    return this.fences.get(id);
  }

  public deleteFence(id: string): void {
    this.fences.delete(id);
    this.touched = true;
  }

  public insertModel(model: PlaceModel): Place {
    this.name = model.name;
    this.address = model.address;
    this.infoWindowContent = model.infoWindowContent;
    this.setPosition(new LatLng(model.latitude, model.longitude));
    this.insertFences(model.fences);
    return this.insertConfigModel(model);
  }

  private insertConfigModel(model: PlaceModel): Place {
    this.scale = model.scale;
    this.origWidth = model.origWidth;
    this.origHeight = model.origHeight;
    this.iconSetId = model.iconSetId;
    this.iconId = model.iconId;
    this.marker.setIcon(model.svgDef);
    return this;
  }

  private insertFences(fences: Map<string, Geofence>): void {
    this.fences = fences;
  }

  getModel(): PlaceModel {
    const model: PlaceModel = {
      name: this.name,
      address: this.address,
      latitude: this.getPosition() ? this.getPosition().lat() : null,
      longitude: this.getPosition() ? this.getPosition().lng() : null,
      fences: this.fences,
      infoWindowContent: this.infoWindowContent,
    };
    return {...model};
    // return {...model, ...this.getDefaultConfig()};
  }

  getDefaultConfig(): PlaceModel {
    const model: PlaceModel = {
      scale: this.scale,
      origWidth: this.origWidth,
      origHeight: this.origHeight,
      iconSetId: this.iconSetId,
      iconId: this.iconId,
      svgDef: this.marker.getIcon() as string
    };
    return;
  }

  setPosition(position: LatLng): void {
    this.marker.setPosition(position);
    this.latitude = position.lat();
    this.longitude = position.lng();
  }

  getPosition(): LatLng {
    return new LatLng(this.latitude, this.longitude);
  }

  getPositionId(): string {
    const position = this.getPosition();
    return !!position ? Place.makePlaceId(position.lat(), position.lng()) : null;
  }

  // Checks if a place shares the location spot of this place.
  isSameSpot(place: Place): boolean {
    return place.getId() === this.getId();
  }

  getId(): string {
    return this.getPositionId();
  }

  addMarkerDescriptions(map: google.maps.Map): void {
    if (this.marker) {
      this.marker.addMarkerDescriptions(this.infoWindowContent, map);
      this.marker.setTitle(this.name);
    }
  }

  public isTutched(): boolean {
    return this.touched;
  }

  public isSaved(value: boolean = null): boolean {
    if (value !== null) {
      this.saved = value;
      this.touched = false;
    }
    return this.saved;
  }
}
