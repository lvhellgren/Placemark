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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Geofence } from '../places/classes/place';

export interface PlaceModel {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  scale?: number;
  origWidth?: number;
  origHeight?: number;
  iconSetId?: string;
  iconId?: string;
  svgDef?: string;
  infoWindowContent?: string;
  fences?: Map<string, Geofence>;
}

export interface FetchFilter {
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {
  private places: Map<string, PlaceModel> = new Map<string, PlaceModel>();

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
    this.places.forEach((value) => {
      if (!!!name || value.name === name) {
        places.push(value);
      }
    });
    return places;
  }

  public fetchPlace(key: string): PlaceModel {
    return this.places.get(key);
  }

  public savePlace(id: string, place: PlaceModel, filter?: FetchFilter): void {
    this.places.set(id, place);
    this.placeSaved.next(id);
    this.issuePlacesFetch(filter);
  }

  public saveUniquePlace(id: string, place: PlaceModel): void {
    const name = place.name;
    const places: PlaceModel[] = this.fetchPlaces({name});
    if (places.length === 0 ||
        places.length === 1 && places[0].latitude === place.latitude && places[0].longitude === place.longitude) {
      this.savePlace(id, place);
    } else {
      this.placeNotSaved.next(id);
    }
  }

  public deletePlace(id: string, filter?: FetchFilter): void {
    this.places.delete(id);
    this.issuePlacesFetch(filter);
  }
}
