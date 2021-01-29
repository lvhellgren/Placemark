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

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Geofence, Place } from '../classes/place';
import { ActivatedRoute, Router } from '@angular/router';
import { ICON_TEMPLATE_SETS, PlacesService, SvgIconHolder } from '../places.service';
import { SubSink } from 'subsink';
import { ErrorDlgComponent } from '../../common/error-dlg/error-dlg.component';
import { MatDialog } from '@angular/material/dialog';
import LatLng = google.maps.LatLng;
import { SvgIcon } from '../../services/svg-icon';
import { CustomIconStoreService } from '../../services/custom-icon-store.service';
import { IconSet } from '../../services/template-icon-store.service';

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.css']
})
export class PlaceComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly lookupPlace = 'Lookup Place';
  private readonly endLookup = 'Cancel Lookup';

  public placeForm: FormGroup;

  public canLookup = false;
  public canApplyIconContent = false;
  public canCreateByCoordinates = false;
  public canCreateByAddress = false;
  public canCancel = true;
  public canDelete: boolean;
  public canSave: boolean;

  public isCustomIconSet = false;
  public customIconSetDisabled = true;
  public iconSets: IconSet[] = ICON_TEMPLATE_SETS;
  public iconSet: { id: string, name: string }[];
  public selectedIconSet: string;
  public selectedIconName: string;

  public fenceIds: string[] = [];
  public selectedFenceId: string;

  public canEnterGeofence = false;
  public canApplyGeofence = false;
  public canDeleteGeofence = false;

  public fenceVisible = true;
  public fenceDisabled = true;


  private place: Place;
  private svgIcon: SvgIcon = null;
  private subSink = new SubSink();

  constructor(private placesService: PlacesService,
              private customIconStoreService: CustomIconStoreService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private router: Router) {
    this.placeForm = this.fb.group({
      name: [''],
      iconSet: [{value: '', disabled: true}],
      iconName: [{value: '', disabled: true}],
      iconTextContent: [{value: '', disabled: true}],
      infoWindowContent: [{value: '', disabled: true}],
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

    this.placeForm.controls.fencesForm.disable({emitEvent: false});
  }

  ngOnInit(): void {
    // Subscriber for initializing the place form with a place definition on marker double-click.
    this.subSink.sink = this.placesService.placeChanged$.subscribe((place: Place) => {
      this.place = place;
      if (!!place) {
        if (place.marker.getIcon()) {
          this.svgIcon = new SvgIcon(place.marker.getIcon());
        }
        this.canSave = place.needsSaving();
        this.canDelete = this.canEnterGeofence = place.isSaved();
        this.fillPlaceForm(place, this.placeForm);

        if (place.isSaved()) {
          this.placeForm.controls.fencesForm.enable({emitEvent: false});
          this.fenceDisabled = false;
        }

        this.enableIconFields(true);
        if (place.hasIconTextContent) {
          this.placeForm.controls.iconTextContent.enable({emitEvent: false});
        } else {
          this.placeForm.controls.iconTextContent.disable({emitEvent: false});
        }

        if (!!!place.marker.getIcon()) {
          this.setDefaultIcon();
        }
      } else {
        this.enableIconFields(false);
      }
    });

    this.subSink.sink = this.customIconStoreService.iconSetsFetched$.subscribe((sets: IconSet[]) => {
      if (!!sets && sets.length > 0) {
        this.iconSets = sets;
      }
    });
  }

  ngAfterViewInit(): void {
    // Reacts to a new icon having been loaded
    this.subSink.sink = this.placesService.iconChanged$.subscribe((holder: SvgIconHolder) => {
      if (!!holder) {
        this.svgIcon = new SvgIcon(holder.svgText);
        this.svgIcon.setSvgId(this.place.getId());
        this.place.setIconSetId(holder.iconSetId);
        this.place.setIconId(holder.iconId);
      } else {
        this.svgIcon = null;
      }
      this.place.setMarker(this.svgIcon);
      this.placesService.placeChanged.next(this.place);
    });

    // Reacts to UI name field value change
    this.subSink.sink = this.placeForm.controls.name.valueChanges.subscribe((name) => {
      this.canLookup = !!name && name.trim().length > 0;
      if (!!this.place) {
        this.place.setName(name);
        this.canSave = this.place.needsSaving();
        this.placeForm.controls.fencesForm.enable({emitEvent: false});
        this.fenceDisabled = false;
      }
    });

    // Reacts to UI icon text parameter value change
    this.subSink.sink = this.placeForm.controls.iconTextContent.valueChanges.subscribe((content) => {
      if (!!this.place) {
        this.place.setIconTextContent(content);
        this.canApplyIconContent = true;
      }
    });

    // Reacts to UI info window field value change
    this.subSink.sink = this.placeForm.controls.infoWindowContent.valueChanges.subscribe((content) => {
      if (!!this.place) {
        this.place.setInfoWindowContent(content);
        this.canSave = this.place.needsSaving();
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
      if (!this.place.isSaved() && !!id && !!this.place && id === this.place.getId()) {
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
      this.placesService.placeChanged.next(place);
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  private fillPlaceForm(place: Place, placeForm: FormGroup): void {
    if (!!place) {
      setTimeout(() => {}); // Skip one thread cycle
      this.canLookup = !!place.getName();
      this.setIconSets(place.getIsCustomIconSet());
      placeForm.patchValue({
        name: place.getName(),
        iconSetId: place.getIconSetId(),
        iconId: place.getIconId(),
        iconTextContent: place.iconTextContent,
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

        this.fillFencesForm(place, this.placeForm);
      } else {
        placeForm.reset({}, {emitEvent: false});
      }

      // Skip a cycle before setting the current selection
      setTimeout(() => {
        if (!!place.getIconSetId()) {
          this.setIconSet(place.getIconSetId());
          this.selectedIconSet = place.getIconSetId();
        }

        setTimeout(() => {
          if (!!place.getIconId()) {
            this.selectedIconName = place.getIconId();
          }
        });
      });

    } else {
      // this.canCreateByAddress = true;
      placeForm.reset({}, {emitEvent: false});
    }
  }

  lookupBtnTitle(): string {
    return !!!this.placesService.fetchFilter.name ? this.lookupPlace : this.endLookup;
  }

  public onLookupClick(): void {
    if (this.lookupBtnTitle() === this.lookupPlace) {
      this.placesService.fetchFilter.name = this.placeForm.value.name;
      this.placesService.loadPlaces();
    } else {
      this.placesService.fetchFilter.name = null;
      this.placesService.loadPlaces();
    }
  }

  public onCustomIconSetToggle(event): void {
    this.setIconSets(event.checked);
  }

  private setIconSets(isCustom: boolean): void {
    this.isCustomIconSet = isCustom;
    this.place.setIsCustomIconSet(isCustom);
    if (isCustom) {
      this.customIconStoreService.fetchSets();
    } else {
      this.iconSets = ICON_TEMPLATE_SETS;
    }
    this.clearIcon();
  }

  public onIconSetChange(source): void {
    this.setIconSet(source.value);
    this.clearIcon();
  }

  private clearIcon(): void {
    this.selectedIconName = '';
    this.placeForm.patchValue({
      iconName: '',
      iconTextContent: '',
      infoWindowContent: ''
    }, {emitEvent: false});
  }

  private setIconSet(setId): void {
    const set = this.iconSets.find(iconSet => iconSet.setId === setId);
    if (!!set) {
      this.iconSet = set.collection;
    }
  }

  onIconNameChange(source): void {
    if (this.isCustomIconSet) {
      this.customIconStoreService.loadIcon(this.selectedIconSet, source.value, ((icon) => {
        const holder: SvgIconHolder = {
          iconSetId: this.selectedIconSet,
          iconId: source.value,
          svgText: icon
        };
        this.placesService.iconChanged.next(holder);
      }));
    } else {
      this.placesService.loadIcon(this.selectedIconSet, source.value);
    }
  }

  onIconContentApplyClick(): void {
    this.svgIcon.setTextContent(this.placeForm.value.iconTextContent);
    this.place.setMarker(this.svgIcon);
    this.placesService.placeChanged.next(this.place);
    this.canApplyIconContent = false;
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

  private enableIconFields(enable: boolean): void {
    if (enable) {
      this.placeForm.controls.iconSet.enable({emitEvent: false});
      this.placeForm.controls.iconName.enable({emitEvent: false});
      this.placeForm.controls.infoWindowContent.enable({emitEvent: false});
    } else {
      this.placeForm.controls.iconSet.disable({emitEvent: false});
      this.placeForm.controls.iconName.disable({emitEvent: false});
      this.placeForm.controls.iconTextContent.disable({emitEvent: false});
      this.placeForm.controls.infoWindowContent.disable({emitEvent: false});
    }
    this.customIconSetDisabled = !enable;
  }

  setDefaultIcon(): void {
    this.selectedIconSet = PlacesService.defaultIconSet();
    this.setIconSet(this.selectedIconSet);
    this.selectedIconName = PlacesService.defaultIcon();
    this.placeForm.patchValue({
      iconSet: PlacesService.defaultIconSet(),
      iconName: PlacesService.defaultIcon()
    }, {emitEvent: false});
  }

  public onFenceIdChange(source): void {
    this.selectedFenceId = source.value;
    if (!!this.selectedFenceId) {
      this.fillFencesForm(this.place, this.placeForm);
      this.placesService.placeChanged.next(this.place);
    }
  }

  onFenceVisibleChange(event): void {
    this.fenceVisible = event.checked;
    this.canApplyGeofence = true;
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

    this.selectedFenceId = fenceId;
    this.canApplyGeofence = false;

    this.place.setFence(fenceId, geofence);
    this.placesService.placeChanged.next(this.place);
  }

  public onDeleteGeofenceClick(): void {
    if (!!this.place.getFences()) {
      const fenceId = this.placeForm.get('fencesForm.fenceId').value;
      this.place.deleteFence(fenceId);
      this.selectedFenceId = null;
      this.placeForm.get('fencesForm.fenceId').setValue('');
      this.canApplyGeofence = false;

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
      this.fenceVisible = fence.visible;
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
      if (!!!this.place.getIconSetId() && !!!this.place.getIconId()) {
        this.place.setIconSetId(this.placeForm.controls.iconSet.value);
        this.place.setIconId(this.placeForm.controls.iconName.value);
      }
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
