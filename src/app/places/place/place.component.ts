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

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Geofence, ICON_KITS, Place } from '../classes/place';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../places.service';
import { SubSink } from 'subsink';
import { ErrorDlgComponent } from '../../error-dlg/error-dlg.component';
import { MatDialog } from '@angular/material/dialog';
import LatLng = google.maps.LatLng;
import { SvgLoadService, SvgWrapper } from '../../services/svg-load.service';

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.css']
})
export class PlaceComponent implements OnInit, OnDestroy, AfterViewInit {
  static FENCES_FORM = 'fencesForm';

  public placeForm: FormGroup;

  public canLookup = false;
  public canCreateByCoordinates = false;
  public canCreateByAddress = false;
  public canCancel = true;
  public canDelete: boolean;
  public canSave: boolean;

  public iconKits: { name: string, collection: { name: string, id: string }[], filePath: string }[] = ICON_KITS;
  public iconKit: { id: string, name: string }[];
  public selectedIconKit: string;
  public selectedIconName;

  public fenceIds: string[] = [];
  public selectedFenceId: string;

  public canEnterGeofence = false;
  public canApplyGeofence = false;
  public canDeleteGeofence = false;
  public fenceVisible = true;


  private place: Place;
  private subSink = new SubSink();

  constructor(private placesService: PlacesService,
              private svgLoadService: SvgLoadService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private router: Router) {
    this.placeForm = this.fb.group({
      name: [''],
      iconKit: [''],
      iconName: [''],
      infoWindowContent: [''],
      coordinatesForm: this.fb.group({
        latitude: ['', [Validators.required]],
        longitude: ['', [Validators.required]],
      }),
      addressForm: this.fb.group({
        address: ['', []]
      }),
      fencesForm: this.fb.group({
        fenceIds: [''],
        fenceId: [''],
        radius: [100],
        fenceVisible: [true],
        fillColor: ['blue'],
        fillOpacity: [0.2],
        strokeColor: ['blue'],
        strokeOpacity: [0.5],
        strokeWeight: [1]
      }),
    });

    this.placeForm.controls[PlaceComponent.FENCES_FORM].disable({emitEvent: false});
  }

  ngOnInit(): void {
    // Subscriber for initializing the place form with a place definition on marker double-click.
    this.subSink.sink = this.placesService.placeChanged$.subscribe((place: Place) => {
      this.place = place;
      if (!!place) {
        this.canDelete = this.canEnterGeofence = place.isSaved();
        this.fillPlaceForm(place, this.placeForm);

        if (this.place.isSaved()) {
          this.placeForm.controls[PlaceComponent.FENCES_FORM].enable({emitEvent: false});
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Reacts to UI name field value change
    this.subSink.sink = this.placeForm.controls.name.valueChanges.subscribe((name) => {
      this.canLookup = !!name && name.trim().length > 0;
      if (!!this.place) {
        this.place.setName(name);
        this.canSave = this.place.isTutched() && !!this.place.getPosition();
        this.placeForm.controls[PlaceComponent.FENCES_FORM].enable({emitEvent: false});
      }
    });

    // Reacts to UI info window field value change
    this.subSink.sink = this.placeForm.controls.infoWindowContent.valueChanges.subscribe((content) => {
      if (!!this.place) {
        this.place.setInfoWindowContent(content);
        this.canSave = this.place.isTutched() && !!this.place.getPosition();
        this.canEnterGeofence = this.canSave;
      }
    });

    // Reacts to UI coordinates form value changes
    this.subSink.sink = this.placeForm.get('coordinatesForm').valueChanges.subscribe((coordinates) => {
      this.canCreateByCoordinates = !!coordinates.latitude && coordinates.longitude;
    });

    // Reacts to UI address form value changes
    this.subSink.sink = this.placeForm.get('addressForm').valueChanges.subscribe((address) => {
      const ADDRESS = 'address';
      if (!!address && address[ADDRESS]) {
        this.canCreateByAddress = !!address && address[ADDRESS].trim().length > 10;
      }
    });

    // Reacts to UI fences form value changes
    this.subSink.sink = this.placeForm.get('fencesForm').valueChanges.subscribe((fence) => {
      this.canApplyGeofence = this.canSave || (!!this.place && this.place.isSaved());
    });

    // Reacts to successful place savings operations
    this.subSink.sink = this.placesService.placeSaved$.subscribe((id: string) => {
      if (!!id && !!this.place && id === this.place.getId()) {
        this.savePlaceFinish(this.place);
      }
    });

    // Reacts to unsuccessful place savings operations
    this.subSink.sink = this.placesService.placeNotSaved$.subscribe((id: string) => {
      if (!!id && !!this.place && id === this.place.getId()) {
        if (confirm(`A place with name ${this.place.getName()} already exists. Do you still want to use this name?`)) {
          this.placesService.savePlace(this.place);
          this.savePlaceFinish(this.place);
        } else {
          this.canSave = this.canApplyGeofence = false;
          this.canDeleteGeofence = true;
        }
      }
    });

    // Subscriber for initializing the place form with a place definition on marker double-click.
    this.subSink.sink = this.placesService.markerDblclick.subscribe((place: Place) => {
      this.fillPlaceForm(place, this.placeForm);
    });

    // Reacts to a new SVG document having been loaded.
    this.subSink.sink = this.svgLoadService.svgLoaded$.subscribe((svgWrapper: SvgWrapper) => {
      console.dir(svgWrapper);
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  private fillPlaceForm(place: Place, placeForm: FormGroup): void {
    if (!!place) {
      this.canLookup = !!place.getName();
      placeForm.patchValue({
        name: place.getName(),
        infoWindowContent: place.infoWindowContent
      }, {emitEvent: false});

      if (!!place.getPosition()) {
        placeForm.patchValue({
          coordinatesForm: {
            latitude: place.getPosition().lat(),
            longitude: place.getPosition().lng()
          }
        }, {emitEvent: false});

        placeForm.patchValue({
          addressForm: {
            address: place.address
          }
        }, {emitEvent: false});

        this.fillFencesForm(this.place, this.placeForm);
      } else {
        placeForm.reset({}, {emitEvent: false});
      }
    } else {
      // this.canCreateByAddress = true;
      placeForm.reset({}, {emitEvent: false});
    }
  }

  onLookupClick(): void {
    this.placesService.loadPlacesByName(this.placeForm.value.name);
  }

  onIconKitChange(source): void {

  }

  onIconNameChange(source): void {

  }

  onCreateByCoordinatesClick(): void {
    const coordinates = this.placeForm.value.coordinatesForm;
    const place = this.placesService.createPlace(new LatLng(coordinates.latitude, coordinates.longitude));
    place.recenter = true;
    this.placesService.placeChanged.next(place);

    this.canCreateByCoordinates = false;
    this.canLookup = false;
  }

  onCreateByAddressClick(): void {
    (new google.maps.Geocoder()).geocode({address: this.placeForm.value.addressForm.address},
      (result, status) => {
        if (status === 'OK' && result.length === 1) {
          const place = this.placesService.createPlace(
            new LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng())
          );
          place.recenter = true;
          place.address = result[0].formatted_address;
          this.placesService.placeChanged.next(place);

          this.canCreateByAddress = false;
          this.canLookup = false;
        } else if (result.length > 1) {
          this.dialog.open(ErrorDlgComponent, {
            data: {
              msg: `Incomplete address`
            }
          });
        } else {
          console.error(`Geocoding failed: ${status}`);
          this.dialog.open(ErrorDlgComponent, {
            data: {
              msg: `Geocoding failed: ${status}`
            }
          });
        }
      });
  }

  public onFenceIdChange(source): void {
    this.selectedFenceId = source.value;
    if (!!this.selectedFenceId) {
      this.fillFencesForm(this.place, this.placeForm);
      this.placesService.placeChanged.next(this.place);
    }
  }

  public onApplyGeofenceClick(): void {
    const fenceId = this.placeForm.get('fencesForm.fenceId').value;
    const geofence: Geofence = {
      id: fenceId,
      radius: this.placeForm.get('fencesForm.radius').value,
      visible: this.fenceVisible,
      fillColor: this.placeForm.get('fencesForm.fillColor').value,
      fillOpacity: this.placeForm.get('fencesForm.fillOpacity').value,
      strokeColor: this.placeForm.get('fencesForm.strokeColor').value,
      strokeOpacity: this.placeForm.get('fencesForm.strokeOpacity').value,
      strokeWeight: this.placeForm.get('fencesForm.strokeWeight').value
    };

    console.dir(geofence);
    this.selectedFenceId = fenceId;
    this.canApplyGeofence = false;

    this.place.setFence(fenceId, geofence);
    this.canSave = true;
    this.placesService.placeChanged.next(this.place);
  }

  public onDeleteGeofenceClick(): void {
    if (!!this.place.getFences()) {
      const fenceId = this.placeForm.get('fencesForm.fenceId').value;
      this.place.getFences().delete(fenceId);
      this.selectedFenceId = null;
      this.placesService.placeChanged.next(this.place);
    }
  }

  private initFencesForm(): void {
    this.placeForm.patchValue(this.fb.group({
      fencesForm: {
        fenceIds: [''],
        fenceId: [''],
        radius: [100],
        fenceVisible: [true],
        fillColor: ['SteelBlue'],
        fillOpacity: [0.2],
        strokeColor: ['SkyBlue'],
        strokeOpacity: [0.5],
        strokeWeight: [1]
      }
    }));
  }

  private fillFencesForm(place: Place, placeForm: FormGroup): void {
    this.fenceIds = place.getFenceIds();
    if (this.fenceIds.length > 0) {
      if (!!!this.selectedFenceId) {
        this.selectedFenceId = this.fenceIds[0];
      }
      const fence = place.getFence(this.selectedFenceId);
      placeForm.patchValue({
        fencesForm: {
          fenceIds: fence.id,
          fenceId: fence.id,
          radius: fence.radius,
          visible: fence.visible,
          fillColor: fence.fillColor,
          fillOpacity: fence.fillOpacity,
          strokeColor: fence.strokeColor,
          strokeOpacity: fence.strokeOpacity,
          strokeWeight: fence.strokeWeight
        }
      }, {emitEvent: false});
      this.canDeleteGeofence = true;
    } else {
      this.canDeleteGeofence = false;
    }
  }

  onCancel(): void {
    this.placesService.placeChanged.next(null);
    this.placesService.loadPlaces();
    this.router.navigate([`../list`], {relativeTo: this.route});
  }

  onDelete(): void {
    this.placesService.deletePlace(this.place);
    this.onCancel();
  }

  onSave(): void {
    if (this.canSave) {
      this.placesService.saveUniquePlace(this.place);
    } else {
      this.dialog.open(ErrorDlgComponent, {
        data: {
          msg: `Please fill in the required fields`
        }
      });
    }
  }

  private savePlaceFinish(place): void {
    place.isSaved(true);
    place.isValid = true;
    this.canDelete = true;
    this.canSave = this.canApplyGeofence = false;
    this.router.navigate([`../list`], {relativeTo: this.route});
  }
}
