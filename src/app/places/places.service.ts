import { Injectable, OnDestroy } from '@angular/core';
import { Place } from './classes/place';
import { SubSink } from 'subsink';
import { BehaviorSubject, Subject } from 'rxjs';
import { DataStoreService, FetchFilter, PlaceModel } from '../services/data-store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import LatLng = google.maps.LatLng;

@Injectable({
  providedIn: 'root'
})
export class PlacesService implements OnDestroy {
  // Initial marker icon defaults
  private defaultScale = 0.8;

  // Informs observers that the current Place object has changed
  public placeChanged = new BehaviorSubject<Place>(null);
  public placeChanged$ = this.placeChanged.asObservable();

  // Informs observers that the status of the current Place object has changed
  public placeStatusChange = new Subject();
  public placeStatusChange$ = this.placeStatusChange.asObservable();

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

  private fetchFilter: FetchFilter = {};

  constructor(private dataService: DataStoreService,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private router: Router) {

    // Subscriber for handling response to place fetch requests
    this.subSink.sink = this.dataService.placesFetched$.subscribe((models: PlaceModel[]) => {
      this.buildCurrentPlaces(models);
      this.placesChanged.next(Array.from(this.currentPlaces.values()));
    });

    // Subscriber for handling response to filtered place fetch requests
    this.subSink.sink = this.dataService.filteredPlacesFetched$.subscribe((models: PlaceModel[]) => {
      this.buildCurrentPlaces(models);
      this.placesChanged.next(Array.from(this.currentPlaces.values()));
      this.router.navigate([`/places/list`]);
    });

    // Subscriber for passing on responses to successful place save requests
    this.subSink.sink = this.dataService.placeSaved$.subscribe((id: string) => {
      this.placeSaved.next(id);
    });

    // Subscriber for passing on responses to unsuccessful place save requests
    this.subSink.sink = this.dataService.placeNotSaved$.subscribe((id: string) => {
      this.placeNotSaved.next(id);
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  private buildCurrentPlaces(models: PlaceModel[]): void {
    this.currentPlaces.clear();
    models.forEach((placeModel: PlaceModel) => {
      const place = new Place(placeModel.iconSetId, placeModel.iconId);
      place.isSaved(true);
      place.isValid = true;

      place.marker.addListener('dblclick', (event: Event) => {
        this.placeChanged.next(this.getPlace(place.getPositionId()));
        this.placeStatusChange.next();
        this.router.navigate([`/places/place`]);
      });

      place.setPosition(new LatLng(placeModel.latitude, placeModel.longitude));
      this.currentPlaces.set(place.getPositionId(), place.insertModel(placeModel));
    });
  }

  // Creates a new Place object containing the default marker
  public createPlace(position: LatLng): Place {
    const place = new Place();
    place.setPosition(position);
    return place;
  }

  public savePlace(place: Place): void {
    this.dataService.savePlace(place.getId(), place.getModel());
  }

  public saveUniquePlace(place: Place): void {
    this.dataService.saveUniquePlace(place.getId(), place.getModel());
  }

  public getPlace(id: string): Place {
    return this.currentPlaces.get(id);
  }

  public deletePlace(place: Place): void {
    this.dataService.deletePlace(place.getId());
    this.placeChanged.next(place);
  }

  public loadPlaces(): void {
    if (this.currentPlaces.size > 0) {
      this.currentPlaces.clear();
    }
    this.dataService.issuePlacesFetch(this.fetchFilter);
  }

  public loadPlacesByName(name: string): void {
    this.fetchFilter = {name};
    this.loadPlaces();
  }
}
