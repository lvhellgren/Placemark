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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Geofence } from '../places/classes/place';

export interface PlaceModel {
  name?: string;
  isCustomIconSet?: boolean;
  address?: string;
  latitude?: number;
  longitude?: number;
  iconSetId?: string;
  iconId?: string;
  svgText?: string;
  textContent?: string;
  infoWindowContent?: string;
  iconWidth?: number;
  iconHeight?: number;
  isOverLayMarker?: boolean;
  fences?: Map<string, Geofence>;
}

export interface FetchFilter {
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlaceStoreService {
  private static placeStoreTag = 'place-store:';
  private static placeFencesStoreTag = 'place-fences-store:';

  private placeModels: Map<string, PlaceModel> = new Map<string, PlaceModel>();

  // Informs observers that the places repository has changed
  private placesFetched = new BehaviorSubject<PlaceModel[]>([]);
  public placesFetched$ = this.placesFetched.asObservable();

  // Informs observers that a filtered places result is available
  private filteredPlacesFetched = new Subject<PlaceModel[]>();
  public filteredPlacesFetched$ = this.filteredPlacesFetched.asObservable();

  // Informs observers that a place has been successfully saved
  private placeSaved = new Subject<string>();
  public placeSaved$ = this.placeSaved.asObservable();

  // Informs observers that a place could not be saved
  private placeNotSaved = new Subject<string>();
  public placeNotSaved$ = this.placeNotSaved.asObservable();

  constructor() {
  }

  public issuePlacesFetch(filter?: FetchFilter): void {
    if (this.placeModels.size === 0) {
      this.loadFromLocalStorage();
    }

    const places: PlaceModel[] = this.fetchPlaces(filter);
    if (!!filter && filter.name) {
      this.filteredPlacesFetched.next(places);
    } else {
      this.placesFetched.next(places);
    }
  }

  private fetchPlaces(filter?: FetchFilter): PlaceModel[] {
    const places: PlaceModel[] = [];
    const name = filter ? filter.name : null;
    this.placeModels.forEach((value) => {
      if (!!!name || value.name === name) {
        places.push(value);
      }
    });
    return places;
  }

  private loadFromLocalStorage(): void {
    Object.keys(localStorage).forEach((placeKey) => {
      if (placeKey.startsWith(PlaceStoreService.placeStoreTag)) {
        // localStorage.removeItem(placeKey);
        const placeModel: PlaceModel = JSON.parse(localStorage.getItem(placeKey));
        const fenceKey = PlaceStoreService.placeFencesStoreTag + placeKey.substring(PlaceStoreService.placeStoreTag.length);
        const fences = JSON.parse(localStorage.getItem(fenceKey)) as [];
        if (!!fences) {
          placeModel.fences = new Map<string, Geofence>();
          fences.forEach((fence: Geofence) => {
            placeModel.fences.set(fence.id, fence);
          });
        }
        this.placeModels.set(placeKey.replace(PlaceStoreService.placeStoreTag, ''), placeModel);
      }
    });
  }

  public fetchPlace(key: string): PlaceModel {
    return this.placeModels.get(key);
  }

  public savePlace(id: string, placeModel: PlaceModel, filter?: FetchFilter): void {
    if (!!placeModel.fences) {
      localStorage.removeItem(PlaceStoreService.placeFencesStoreTag + id);
      const fences: any = [];
      placeModel.fences.forEach((value, key) => {
        fences.push(value);
      });
      localStorage.setItem(PlaceStoreService.placeFencesStoreTag + id, JSON.stringify(fences));
      placeModel.fences = null;
    }
    localStorage.setItem(PlaceStoreService.placeStoreTag + id, JSON.stringify(placeModel));
    this.placeSaved.next(id);
    this.placeModels.clear();
    this.issuePlacesFetch(filter);
  }

  /**
   * Saves a place only if the name is not shared by a differently located place.
   * @param id
   * @param placeModel
   */
  public saveUniquePlace(id: string, placeModel: PlaceModel): void {
    const name = placeModel.name;
    const places: PlaceModel[] = this.fetchPlaces({name});
    if (places.length === 0 ||
        places.length === 1 && places[0].latitude === placeModel.latitude && places[0].longitude === placeModel.longitude) {
      this.savePlace(id, placeModel);
    } else {
      this.placeNotSaved.next(id);
    }
  }

  public deletePlace(id: string, filter?: FetchFilter): void {
    localStorage.removeItem(PlaceStoreService.placeStoreTag + id);
    localStorage.removeItem(PlaceStoreService.placeFencesStoreTag + id);
    this.placeModels.clear();
    this.issuePlacesFetch(filter);
  }
}
