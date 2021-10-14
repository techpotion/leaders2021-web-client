import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
} from '@angular/core';

import _ from 'lodash';
import mapboxgl from 'mapbox-gl';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

import { LatLng } from '../../models/lat-lng';
import { MapZoom } from '../../models/map-zoom';

import MapboxLanguage from '@mapbox/mapbox-gl-language';

mapboxgl.accessToken = environment.mapToken;

const MOSCOW_COORDS: LatLng = { lng: 37.618423, lat: 55.751244 };

const DEFAULT_ZOOM: MapZoom = {
  current: 11,
  min: 8,
  max: 18,
};

const EVENT_DEBOUNCE_TIME = 300;

@Component({
  selector: 'tp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {

  constructor() { }

  // #region Lifecycle hooks

  public ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.centerSubject.value,
      zoom: this.zoomSubject.value.current,
      minZoom: this.zoomSubject.value.min,
      maxZoom: this.zoomSubject.value.max,
    });

    // eslint-disable-next-line
    this.map.addControl(new MapboxLanguage());

    this.subscribeOnMapEvents();
  }

  // #endregion


  // #region Map

  private map?: mapboxgl.Map;

  private subscribeOnMapEvents(): void {
    if (!this.map) {
      throw new Error('Failed to subscribe to map events: '
        + 'map is not initialized yet.');
    }
    // Subscribing on events of existing map instance.
    const existingMap = this.map;

    existingMap.on('zoom', () => this.zoomSubject.next(
      { ...this.zoomSubject.value, current: existingMap.getZoom() },
    ));
    existingMap.on('move', () =>
      this.centerSubject.next(existingMap.getCenter()));
  }

  // #endregion


  // #region Zoom

  @Input()
  public set zoom(value: number) {
    this.zoomSubject.next({ ...this.zoomSubject.value, current: value });

    if (this.map) {
      this.map.setZoom(value);
    }
  }

  private readonly zoomSubject = new BehaviorSubject<MapZoom>(
    DEFAULT_ZOOM,
  );

  @Output()
  public readonly zoomChange = this.zoomSubject.pipe(
    distinctUntilChanged(),
    debounceTime(EVENT_DEBOUNCE_TIME),
  );

  @Input()
  public set maxzoom(value: number) {
    this.zoomSubject.next({ ...this.zoomSubject.value, max: value });

    if (this.map) {
      this.map.setMaxZoom(value);
    }
  }

  @Input()
  public set minZoom(value: number) {
    this.zoomSubject.next({ ...this.zoomSubject.value, min: value });

    if (this.map) {
      this.map.setMinZoom(value);
    }
  }

  // #endregion


  // #region Center

  @Input()
  public set center(value: LatLng) {
    this.centerSubject.next(value);

    if (this.map) {
      this.map.setCenter(value);
    }
  }

  private readonly centerSubject = new BehaviorSubject<LatLng>(MOSCOW_COORDS);

  @Output()
  public readonly centerChange = this.centerSubject.pipe(
    distinctUntilChanged((curr, prev) => _.isEqual(curr, prev)),
    debounceTime(EVENT_DEBOUNCE_TIME),
  );

  // #endregion

}
