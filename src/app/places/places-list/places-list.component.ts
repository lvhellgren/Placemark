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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Place } from '../classes/place';
import { SubSink } from 'subsink';
import { ActivatedRoute, Router } from '@angular/router';
import { ICON_TEMPLATE_SETS, PlacesService } from '../places.service';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.css']
})
export class PlacesListComponent implements OnInit, OnDestroy {
  public dataSource = new MatTableDataSource<Place>();
  public displayedColumns = ['select', 'name', 'iconSet', 'icon'];
  public isAllSelectedChecked = false;
  public isAllSelectedIndeterminate = false;
  public selectedPlaces = new Map<string, string>();
  public disableDelete = true;

  private subSink = new SubSink();
  private tapCount = 0;
  private place: Place = null;

  constructor(private placesService: PlacesService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.subSink.sink = this.placesService.placesChanged$.subscribe((places: Place[]) => {
      if (!!places) {
        this.dataSource.data = places;
      }
    });

    this.subSink.sink = this.placesService.placeChanged$.subscribe((place: Place) => {
      if (!!place) {
        this.place = place ? place : null;
      }
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  onRowClick(place: Place): void {
    this.placesService.placeChanged.next(place);
    place.marker.bounce();
  }

  onRowDblclick(place: Place): void {
    this.placesService.placeChanged.next(place);
    this.router.navigate([`../place`], {relativeTo: this.route});
  }

  // To handle click and dblClick also for mobile devices
  onRowTap(place: Place): void {
    this.tapCount++;
    setTimeout(() => {
      if (this.tapCount === 1) {
        this.tapCount = 0;
        this.onRowClick(place);
      }
      if (this.tapCount > 1) {
        this.tapCount = 0;
        this.onRowDblclick(place);
      }
    }, 300);
  }

  rowBackground(row): string {
    return this.isSelected(row) ? '#3f51b5' : '';
  }

  rowColor(row): string {
    return this.isSelected(row) ? 'white' : '';
  }

  private isSelected(place): boolean {
    return !!place && this.place ? place.getId() === this.place.getId() : false;
  }

  getPlaceId(place: Place): string {
    return place.getId();
  }

  public getIconSetName(place: Place): string {
    let iconSetName: string;
    if (place.getIsCustomIconSet()) {
      iconSetName = place.getIconSetId();
    } else {
      const set = ICON_TEMPLATE_SETS.find(item => item.setId === place.getIconSetId());
      iconSetName = !!set ? set.name : 'N/A';
    }
    return iconSetName;
  }

  public getIconName(place: Place): string {
    let iconName: string;
    if (place.getIsCustomIconSet()) {
      iconName = place.getIconId();
    } else {
      const set = ICON_TEMPLATE_SETS.find(item => item.setId === place.getIconSetId());
      if (!!set) {
        const icon = set.collection.find(item => item.id === place.getIconId());
        iconName = icon ? icon.name : 'N/A';
      } else {
        console.error(`No icon set for ID: ${place.getIconSetId()}`);
        iconName = 'N/A';
      }
    }
    return iconName;
  }

  public onSelectAllChange(event): void {
    this.isAllSelectedChecked = event.checked;
    if (this.isAllSelectedChecked) {
      this.dataSource.data.forEach((place) => {
        this.selectedPlaces.set(place.getId(), '');
      });
      this.disableDelete = false;
    } else {
      this.selectedPlaces.clear();
      this.disableDelete = true;
    }
  }

  public onSelectRowChange(event): void {
    if (event.checked) {
      this.selectedPlaces.set(event.source.id, '');
    } else {
      this.selectedPlaces.delete(event.source.id);
    }

    this.setAllSelectedStatus();
  }

  private setAllSelectedStatus(): void {
    if (this.selectedPlaces.size === 0) {
      this.isAllSelectedChecked = false;
      this.disableDelete = true;
      this.isAllSelectedIndeterminate = false;
    } else if (this.selectedPlaces.size === this.dataSource.data.length) {
      this.isAllSelectedChecked = true;
      this.isAllSelectedIndeterminate = false;
      this.disableDelete = false;
    } else {
      this.isAllSelectedIndeterminate = true;
      this.disableDelete = false;
    }
  }

  public onDeletePlacesClick(): void {
    this.selectedPlaces.forEach((value, key) => {
      this.placesService.deletePlaceById(key);
    });
    this.selectedPlaces.clear();
    this.setAllSelectedStatus();
  }
}
