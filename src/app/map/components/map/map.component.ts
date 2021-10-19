import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
} from '@angular/core';

import _ from 'lodash';
import mapboxgl from 'mapbox-gl';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

import { LatLng } from '../../models/lat-lng';
import { MapZoom } from '../../models/map-zoom';
import { Heatmap } from '../../models/heatmap';
import { MarkerLayer, MarkerLayerSource } from '../../models/marker-layer';

import MapboxLanguage from '@mapbox/mapbox-gl-language';

import { MapService } from '../../services/map.service';
// import { ComponentRenderService } from
// '../../../shared/services/component-render.service';


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
    // public readonly componentRenderer:
    // ComponentRenderService<SportObjectBriefInfoComponent>,
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

    existingMap.on('render', () => this.renderEvent.next());

    existingMap.on('load', () => {
      for (const callback of this.loadCallbacks) {
        callback();
      }
      this.loadCallbacks = [];
    });
  }

  public readonly renderEvent = new Subject<void>();

  public loadCallbacks: (() => void)[] = [];

  // #endregion


  // #region Marker layer

  // TODO: popups
  // for (const [id, obj] of objects.entries()) {
  // const popupContent = this.componentRenderer.injectComponent(
  // SportObjectBriefInfoComponent,
  // c => { c.obj = obj; },
  // );
  // const popup = new mapboxgl.Popup();
  // popup.setDOMContent(popupContent);

  // const marker = markers.get(id);
  // if (!marker) { continue; }
  // popup.setLngLat(marker.getLngLat());
  // marker.setPopup(popup);
  // }
  private markerLayers: MarkerLayer[] = [];

  @Input()
  public set markerLayerSources(sources: MarkerLayerSource[] | null) {
    const updateSources = sources ?? [];

    if (!this.map || !this.map.loaded()) {
      this.loadCallbacks.push(() => this.updateMarkerLayers(updateSources));
      return;
    }

    this.updateMarkerLayers(updateSources);
  }

  private updateMarkerLayers(sources: MarkerLayerSource[]): void {
    if (!this.map || !this.map.loaded()) {
      throw new Error('Cannot update marker layers: map is not loaded');
    }
    const loadedMap = this.map;

    this.mapUtils.removeMarkerLayers(loadedMap, this.markerLayers);
    this.markerLayers = [];

    sources.forEach((source, index) => {
      const id = `marker-layer${index}`;
      const layer = this.mapUtils.addMarkerLayer(loadedMap, source, id);
      layer.renderSubscription = this.renderEvent.subscribe(
        () => this.mapUtils.renderLayer(
          loadedMap, id, source.idMethod, layer.markers,
        ),
      );
      this.markerLayers.push(layer);
    });
  }

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
