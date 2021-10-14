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


mapboxgl.accessToken = environment.mapToken;
const MOSCOW_COORDS: LatLng = { lng: 37.618423, lat: 55.751244 };
const DEFAULT_ZOOM = 11;
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
      zoom: this.zoomSubject.value,
    });

    this.map.on('zoom', () => this.zoomSubject.next(this.map.getZoom()));
    this.map.on('move', () => this.centerSubject.next(this.map.getCenter()));
  }

  // #endregion


  // #region Map

  public map!: mapboxgl.Map;

  // #endregion


  // #region Zoom

  @Input()
  public set zoom(value: number) {
    this.zoomSubject.next(value);
    this.map.setZoom(value);
  }

  private readonly zoomSubject = new BehaviorSubject<number>(DEFAULT_ZOOM);

  @Output()
  public readonly zoomChange = this.zoomSubject.pipe(
    distinctUntilChanged(),
    debounceTime(EVENT_DEBOUNCE_TIME),
  );

  // #endregion


  // #region Center

  @Input()
  public set center(value: LatLng) {
    this.centerSubject.next(value);
    this.map.setCenter(value);
  }

  private readonly centerSubject = new BehaviorSubject<LatLng>(MOSCOW_COORDS);

  @Output()
  public readonly centerChange = this.centerSubject.pipe(
    distinctUntilChanged((curr, prev) => _.isEqual(curr, prev)),
    debounceTime(EVENT_DEBOUNCE_TIME),
  );

  // #endregion

}
