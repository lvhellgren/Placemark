import { Injectable, OnDestroy } from '@angular/core';
import { Place } from './classes/place';
import { SubSink } from 'subsink';
import { BehaviorSubject, Subject } from 'rxjs';
import { FetchFilter, PlaceModel, PlaceStoreService } from '../services/place-store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  FONT_AWESOME_ICON_SET,
  AWESOME_ICONS,
  EXELOR_ICONS,
  EXELOR_ICON_SET,
  MAPKEY_ICONS,
  MAPKEY_ICON_SET,
  TemplateIconStoreService
} from '../services/template-icon-store.service';
import { ErrorDlgComponent } from '../common/error-dlg/error-dlg.component';
import LatLng = google.maps.LatLng;

const GOOGLE_ICONS = [
  {name: '', id: ''},
  {name: 'Droplet', id: 'droplet'},
];

const DEFAULT_ICON_SET = 'default';
const DEFAULT_ICON = 'droplet';
const GOOGLE_ICON_SET = DEFAULT_ICON_SET;

export const ICON_TEMPLATE_SETS = [
  {name: 'Exelor', collection: EXELOR_ICONS, setId: EXELOR_ICON_SET},
  {name: 'Font Awesome', collection: AWESOME_ICONS, setId: FONT_AWESOME_ICON_SET},
  {name: 'Google', collection: GOOGLE_ICONS, setId: GOOGLE_ICON_SET},
  {name: 'Mapkey', collection: MAPKEY_ICONS, setId: MAPKEY_ICON_SET},
];

export interface SvgIconHolder {
  iconSetId: string;
  iconId: string;
  svgText: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService implements OnDestroy {
  // Informs observers that the current Place object has changed
  public placeChanged = new BehaviorSubject<Place>(null);
  public placeChanged$ = this.placeChanged.asObservable();

  // Informs observers that a new icon is available for the current Place object
  public iconChanged = new Subject<SvgIconHolder>();
  public iconChanged$ = this.iconChanged.asObservable();

  // Informs observers that the places collection has changed
  private placesChanged = new BehaviorSubject<Place[]>([]);
  public placesChanged$ = this.placesChanged.asObservable();

  // Informs observers that a place marker should be deleted
  public markerDelete = new Subject<Place>();
  public markerDelete$ = this.markerDelete.asObservable();

  // Informs observers that a map marker has been double-clicked
  public markerDblclick = new Subject<Place>();
  public markerDblclick$ = this.markerDblclick.asObservable();

  // Informs observers that a place has been successfully saved
  private placeSaved = new Subject<string>();
  public placeSaved$ = this.placeSaved.asObservable();

  // Informs observers that a place could not be saved
  private placeNotSaved = new Subject<string>();
  public placeNotSaved$ = this.placeNotSaved.asObservable();

  private subSink = new SubSink();

  private currentPlaces: Map<string, Place> = new Map<string, Place>();

  public fetchFilter: FetchFilter = {};

  public static defaultIconSet(): string {
    return DEFAULT_ICON_SET;
  }
  public static defaultIcon(): string {
    return DEFAULT_ICON;
  }

  constructor(private placeStoreService: PlaceStoreService,
              private templateIconStoreService: TemplateIconStoreService,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private router: Router) {

    // Subscriber for handling response to place fetch requests
    this.subSink.sink = this.placeStoreService.placesFetched$.subscribe((models: PlaceModel[]) => {
      this.buildCurrentPlaces(models);
      this.placesChanged.next(Array.from(this.currentPlaces.values()));
    });

    // Subscriber for handling response to filtered place fetch requests
    this.subSink.sink = this.placeStoreService.filteredPlacesFetched$.subscribe((models: PlaceModel[]) => {
      this.buildCurrentPlaces(models);
      this.placesChanged.next(Array.from(this.currentPlaces.values()));
      this.router.navigate([`/places/list`]);
    });

    // Subscriber for passing on responses to successful place save requests
    this.subSink.sink = this.placeStoreService.placeSaved$.subscribe((id: string) => {
      this.placeSaved.next(id);
    });

    // Subscriber for passing on responses to unsuccessful place save requests
    this.subSink.sink = this.placeStoreService.placeNotSaved$.subscribe((id: string) => {
      this.placeNotSaved.next(id);
    });

    this.loadPlaces();
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  private buildCurrentPlaces(models: PlaceModel[]): void {
    this.currentPlaces.clear();
    models.forEach((model: PlaceModel) => {
      const place = new Place(new LatLng(model.latitude, model.longitude));
      place.isSaved(true);

      place.marker.setIsOverlay(model.isOverLayMarker);
      place.marker.setPosition(new LatLng(model.latitude, model.longitude));
      place.marker.setIconDimensions(model.iconWidth, model.iconHeight);
      place.marker.addListener('dblclick', (event: Event) => {
        this.placeChanged.next(this.getPlace(place.getPositionId()));
        this.router.navigate([`/places/place`]);
      });

      this.currentPlaces.set(place.getPositionId(), place.insertModel(model));
    });
  }

  // Creates a new Place object containing the default marker
  public createPlace(position: LatLng): Place {
    const place = new Place(position);
    return place;
  }

  public loadIcon(iconSetId: string, iconId: string): void {
    if (iconSetId === DEFAULT_ICON_SET || !!!iconId) {
      this.iconChanged.next(null);
    } else if (!!iconId) {
      // Load from repository.
      this.templateIconStoreService.loadIcon(iconSetId, iconId, (svgText) => {
        try {
          const holder: SvgIconHolder = {
            iconSetId, iconId, svgText
          };
          this.iconChanged.next(holder);
        } catch (e) {
          this.dialog.open(ErrorDlgComponent, {
            data: {
              msg: e.toString()
            }
          });
        }
      });
    }
  }

  public savePlace(place: Place): void {
    this.placeStoreService.savePlace(place.getId(), place.getModel());
  }

  public saveUniquePlace(place: Place): void {
    this.placeStoreService.saveUniquePlace(place.getId(), place.getModel());
  }

  public getPlace(id: string): Place {
    return this.currentPlaces.get(id);
  }

  public deletePlace(place: Place): void {
    this.deletePlaceById(place.getId());
    this.placeChanged.next(place);
  }

  public deletePlaceById(id: string): void {
    this.placeStoreService.deletePlace(id);
  }

  public loadPlaces(): void {
    if (this.currentPlaces.size > 0) {
      this.currentPlaces.clear();
    }
    this.placeStoreService.issuePlacesFetch(this.fetchFilter);
  }
}
