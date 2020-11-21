import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../places.service';
import { MapFence, Place } from '../classes/place';
import { SubSink } from 'subsink';
import { setBounds } from '../../common/map-common';
import { OverlayMarker } from '../classes/overlay-marker';
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral;

@Component({
  selector: 'app-places-map',
  template: '<div #mapContainer id="map"></div>',
  styleUrls: ['./places-map.component.css']
})
export class PlacesMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private gmap: ElementRef;
  private latitude = 33.632989970769266;
  private longitude = -117.87636384491788;
  private coordinates = new google.maps.LatLng(this.latitude, this.longitude);

  private mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    streetViewControl: true,
    disableDoubleClickZoom: true,
    zoom: 16
  };

  private map: google.maps.Map;

  private subSink = new SubSink();

  private displayedMarkers: Map<string, google.maps.Marker | OverlayMarker> = new Map();
  private displayedFences: Map<string, Map<string, MapFence>> = new Map();

  constructor(private placesService: PlacesService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.mapOptions.center = new google.maps.LatLng(this.latitude, this.longitude);
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    this.addMapListener();

    // Subscriber for rendering a single marker.
    this.subSink.sink = this.placesService.placeChanged$.subscribe((place: Place) => {
      if (!!place) {
        if (place.recenter) {
          place.recenter = false;
          this.map.setCenter(place.marker.getPosition());
        } else {
          this.map.setCenter(null);
        }
        this.displayMarker(place);
      }
    });

    // Subscriber for deleting a single marker.
    this.subSink.sink = this.placesService.markerDelete$.subscribe((place: Place) => {
      if (place && !place.isSaved) {
        place.marker.setMap(null);
        this.removeFences(place.getId());
      }
    });

    // Subscriber for rendering a list of stored places.
    this.subSink.sink = this.placesService.placesChanged$.subscribe((places: Place[]) => {
      if (!!places) {
        const bounds: LatLngBoundsLiteral = {east: -180, north: 0, south: 90, west: 0};
        let activeMarkerCount = 0;

        this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
        this.addMapListener();

        places.forEach((place) => {
          this.displayMarker(place);
          place.addMarkerDescriptions(this.map);

          activeMarkerCount++;
          setBounds(place.marker.getPosition().lat(), place.marker.getPosition().lng(), bounds);
        });

        if (activeMarkerCount > 1) {
          this.map.fitBounds(bounds);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  private addMapListener(): void {
    // Creates a new place object when a map location is double clicked
    this.map.addListener('dblclick', (location) => {
      // if (confirm('Create new place at this location?')) {
      this.router.navigate([`./place`], {relativeTo: this.route})
        .then(() => {
          const place = this.placesService.createPlace(location.latLng);
          this.placesService.placeChanged.next(place);
        });
      // }
    });
  }

  private displayMarker(place: Place): void {
    this.removeExistingMarker(place.getId());
    this.displayedMarkers.set(place.getId(), place.marker.getMarkerImpl());
    place.marker.setMap(this.map, Place.makeSvgId(place.getPosition()));

    const fences = place.getFences();
    if (!!fences && fences.size > 0) {
      this.displayFences(place);
    }
  }

  // Removes any marker and any associated fences already existing at a location
  // where a new marker is about to be created.
  private removeExistingMarker(id): void {
    const marker = this.displayedMarkers.get(id);
    if (!!marker) {
      marker.setMap(null);
      this.displayedMarkers.delete(id);
      this.removeFences(id);
    }
  }

  private displayFences(place: Place): void {
    const fences = place.getFences();
    Array.from(fences.values()).forEach((fence) => {
      const mapFence = new MapFence(fence.id, {
        center: place.getPosition(),
        radius: fence.radius,
        visible: fence.visible,
        fillColor: fence.fillColor,
        fillOpacity: fence.fillOpacity,
        strokeColor: fence.strokeColor,
        strokeOpacity: fence.strokeOpacity,
        strokeWeight: fence.strokeWeight
      });
      mapFence.setMap(this.map);

      let fencesMap = this.displayedFences.get(place.getId());
      if (!!fencesMap) {
        fencesMap.set(fence.id, mapFence);
      } else {
        fencesMap = new Map<string, MapFence>();
        fencesMap.set(fence.id, mapFence);
        this.displayedFences.set(place.getId(), fencesMap);
      }
    });
  }

  // Remove all map fences for a marker
  private removeFences(markerId: string): void {
    const mapFences = this.displayedFences.get(markerId);
    if (!!mapFences) {
      Array.from(mapFences.values()).forEach((mapFence) => {
        mapFence.setMap(null);
        const rslt = mapFences.delete(mapFence.fenceId as string);
      });
    }
  }
}
