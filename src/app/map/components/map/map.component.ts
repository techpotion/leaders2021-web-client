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
import { Heatmap } from '../../models/heatmap';

import MapboxLanguage from '@mapbox/mapbox-gl-language';

import { MapService } from '../../services/map.service';
import { SportObjectsApiService } from '../../../sport-objects/services/sport-objects-api.service';


mapboxgl.accessToken = environment.map.token;

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

  constructor(
    public readonly mapUtils: MapService,
    public readonly sportObjectApi: SportObjectsApiService,
  ) { }

  // #region Lifecycle hooks

  public ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: environment.map.style,
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

    existingMap.on('load', () => {
      for (const callback of this.loadCallbacks) {
        callback();
      }
      this.loadCallbacks = [];

      void this.sportObjectApi.getObjectsGeoJson().toPromise().then(featureCollection => {
        existingMap.addSource('markers', {
          type: 'geojson',
          data: featureCollection,
          cluster: true,
          clusterRadius: 100,
        });

        existingMap.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'markers',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#193C9D',
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40,
            ],
          },
        });

        existingMap.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'markers',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans SemiBold', 'Arial Unicode MS Bold'],
            'text-size': 22,
          },
          paint: {
            'text-color': '#FFFFFF',
          },
        });

        existingMap.addLayer({
          id: 'unclustered',
          type: 'circle',
          source: 'markers',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
          },
        });



        // const markers: mapboxgl.Marker[] = [];
        // for (const obj of objects.slice(0, 100)) {
          // const marker = new mapboxgl.Marker({
            // anchor: 'bottom',
          // });
          // marker.setLngLat(obj.objectPoint);
          // marker.addTo(existingMap);
          // markers.push(marker);
        // }
      });
    });
  }

  public loadCallbacks: (() => void)[] = [];

  // #endregion


  // #region Heatmap

  private heatmapIds: string[] = [];

  @Input()
  public set heatmaps(sources: Heatmap[] | null) {
    const updateSources = sources ?? [];

    if (!this.map || !this.map.loaded()) {
      this.loadCallbacks.push(() => this.updateHeatmaps(updateSources));
      return;
    }

    this.updateHeatmaps(updateSources);
  }

  private updateHeatmaps(sources: Heatmap[]): void {
    if (!this.map || !this.map.loaded()) {
      throw new Error('Cannot update heatmaps: map is not loaded');
    }
    const loadedMap = this.map;

    this.mapUtils.removeHeatmaps(loadedMap, this.heatmapIds);
    this.heatmapIds = [];

    sources.forEach((source, index) => {
      const id = `heatmap${index}`;
      this.mapUtils.addHeatmap(loadedMap, source, id);
      this.heatmapIds.push(id);
    });
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
