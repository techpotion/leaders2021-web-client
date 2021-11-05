import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';

import _ from 'lodash';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

import { LatLng } from '../../models/lat-lng';
import { MapZoom } from '../../models/map-zoom';
import { Heatmap } from '../../models/heatmap';
import { MarkerLayer, MarkerLayerSource } from '../../models/marker-layer';
import { PolygonLayerSource } from '../../models/polygon-layer';
import { PopupSource } from '../../models/popup';
import { MapEvent } from '../../models/map-event';


import { MapService, PolygonDrawMode } from '../../services/map.service';
import { isNotNil } from '../../../shared/utils/is-not-nil';


mapboxgl.accessToken = environment.map.token;

const MOSCOW_COORDS: LatLng = { lng: 37.618423, lat: 55.751244 };

const DEFAULT_ZOOM: MapZoom = {
  current: 11,
  min: 8,
  max: 18,
};

const EVENT_DEBOUNCE_TIME = 300;

const EXTRA_BOUNDS_PADDING = 10;

@Component({
  selector: 'tp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit, OnDestroy {

  constructor(
    public readonly mapUtils: MapService,
  ) {
    this.subscriptions.push(
      ...this.subscribeChangeDrawMode(),
      this.subscribePolygonFly(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


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

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

    existingMap.on('mousemove', event => this.sourceMouseMove.next({
      point: event.lngLat,
      mouse: {
        x: event.originalEvent.x,
        y: event.originalEvent.y,
      },
    }));

    existingMap.on('sourcedata', (event: mapboxgl.MapSourceDataEvent) => {
      // eslint-disable-next-line
      if (!event.sourceDataType
          && existingMap.isSourceLoaded(event.sourceId)) {
        this.sourceLoad.next(event.sourceId);
      }
    });

    existingMap.on('render', () => this.renderEvent.next());

    this.subscribeOnMapLoadEvent(existingMap);

    existingMap.on('draw.delete', () => {
      this.polygonDrawDelete.emit();
      this.onPolygonChange();
    });

    existingMap.on('draw.create', (event: MapboxDraw.DrawCreateEvent) =>
      this.onPolygonChange(
        event.features[0] as GeoJSON.Feature<GeoJSON.Polygon>,
      ));

    existingMap.on('draw.update', (event: MapboxDraw.DrawUpdateEvent) => {
      this.onPolygonChange(
        event.features[0] as GeoJSON.Feature<GeoJSON.Polygon>,
      );
    });

    existingMap.on('draw.modechange', (event: MapboxDraw.DrawModeChageEvent) => {
      this.drawMode.next(event.mode);
    });
  }

  public readonly renderEvent = new Subject<void>();

  // #endregion


  // #region Load event

  private loadCallbacks: (() => void)[] = [];

  private subscribeOnMapLoadEvent(map: mapboxgl.Map): void {
    map.on('load', () => {
      this.mapIsLoaded = true;
      this.mapLoad.emit();

      for (const callback of this.loadCallbacks) {
        callback();
      }
      this.loadCallbacks = [];
    });
  }

  private mapIsLoaded = false;

  @Output()
  public readonly mapLoad = new EventEmitter<void>();

  private readonly sourceLoad = new BehaviorSubject<string | null>(null);

  // #endregion


  // #region Map events

  @Input()
  public set event(value: MapEvent | null) {
    if (!value) {
      return;
    }

    if (value.event === 'clear-polygon') {
      if (this.draw) {
        this.draw.deleteAll();
        this.polygonDrawDelete.emit();
        this.onPolygonChange();
      }
    }
  }

  // #endregion


  // #region Mouse actions

  private readonly sourceMouseMove = new BehaviorSubject<{
    point: LatLng;
    mouse: { x: number; y: number };
  } | null>(null);

  @Output()
  public readonly mouseMove = this.sourceMouseMove.pipe(
    filter(isNotNil),
  );

  // #endregion


  // #region Bounds

  private readonly boundsPaddingSubject =
  new BehaviorSubject<mapboxgl.PaddingOptions | number | null>(null);

  @Input()
  public set boundsPadding(value: mapboxgl.PaddingOptions | number | null) {
    this.boundsPaddingSubject.next(value);
  }

  /**
   * Flies to center of polygon and
   * fits it into map bounds with given paddings.
   *
   * @param polygon Polygon to fit
   * @param padding Padding in px
   */
  private fitBounds(
    polygon: LatLng[],
    padding: mapboxgl.PaddingOptions | number,
  ): void {
    if (!this.map || !this.mapIsLoaded) {
      throw new Error('Cannot fit polygon: map is not loaded.');
    }

    this.map.flyTo({ center: this.mapUtils.getPolygonCenter(polygon) });
    const structurizedPadding = typeof padding === 'number'
      ? {
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
      } : padding;

    this.map.fitBounds(this.mapUtils.getPolygonBounds(polygon), {
      padding: {
        top: structurizedPadding.top + EXTRA_BOUNDS_PADDING,
        bottom: structurizedPadding.bottom + EXTRA_BOUNDS_PADDING,
        right: structurizedPadding.right + EXTRA_BOUNDS_PADDING,
        left: structurizedPadding.left + EXTRA_BOUNDS_PADDING,
      },
    });
  }

  // #endregion


  // #region Polygon

  private polygonLayerIds: string[] = [];

  @Input()
  public set polygonLayerSources(sources: PolygonLayerSource[] | null) {
    const updateSources = sources ?? [];

    if (!this.map || !this.mapIsLoaded) {
      this.loadCallbacks.push(() => this.updatePolygonLayers(updateSources));
      return;
    }

    this.updatePolygonLayers(updateSources);
  }

  private updatePolygonLayers(sources: PolygonLayerSource[]): void {
    if (!this.map || !this.mapIsLoaded) {
      throw new Error('Cannot update polygon layers: map is not loaded');
    }
    const loadedMap = this.map;

    this.mapUtils.removePolygonLayers(loadedMap, this.polygonLayerIds);
    this.polygonLayerIds = [];

    sources.forEach((source, index) => {
      const id = `polygon-layer${index}`;

      this.mapUtils.addPolygonLayer(loadedMap, source, id);

      this.polygonLayerIds.push(id);
    });
  }

  // #endregion


  // #region Polygon draw

  private draw?: MapboxDraw;

  @Output()
  public readonly drawMode =
  new BehaviorSubject<MapboxDraw.DrawMode | null>(null);

  @Input()
  public set polygonDraw(mode: PolygonDrawMode | null) {
    if (!this.map || !this.mapIsLoaded) {
      this.loadCallbacks.push(() => this.enablePolygonDraw(mode));
      return;
    }
    this.enablePolygonDraw(mode);
  }

  @Input()
  public set polygon(value: LatLng[] | null) {
    if (!this.map || !this.mapIsLoaded) {
      this.loadCallbacks.push(() => this.setPolygon(value));
      return;
    }
    this.setPolygon(value);
  }

  private setPolygon(polygon: LatLng[] | null): void {
    if (!this.map || !this.mapIsLoaded) {
      throw new Error('Cannot set polygon: map is not loaded');
    }
    if (!this.draw && !polygon) {
      return;
    }

    if (!this.draw) {
      throw new Error('Polygon draw is disabled.'
        + 'Enable before polygon setting.');
    }

    if (!polygon) {
      this.draw.deleteAll();
      this.polygonDrawDelete.emit();
      this.onPolygonChange();
      return;
    }

    this.draw.set({
      type: 'FeatureCollection',
      features: [this.mapUtils.convertToGeoJsonPolygon(polygon)],
    });
    this.polygonDrawChange.next(polygon);
  }

  private subscribePolygonFly(): Subscription {
    return combineLatest([
      this.boundsPaddingSubject,
      this.polygonDrawChange,
    ]).subscribe(([boundsPadding, polygon]) => {
      if (!boundsPadding || !polygon
        || !this.map || !this.mapIsLoaded) { return; }

      this.fitBounds(polygon, boundsPadding);
    });
  }

  private removePolygonDraw(map: mapboxgl.Map): void {
    if (this.draw) {
      map.removeControl(this.draw);
    }
  }

  private enablePolygonDraw(mode: PolygonDrawMode | null): void {
    if (!this.map || !this.mapIsLoaded) {
      throw new Error('Cannot update polygon draw: map is not loaded');
    }
    const loadedMap = this.map;

    if (!mode) {
      this.removePolygonDraw(loadedMap);
      this.polygonDrawChange.emit(null);
      this.draw = undefined;
      this.drawMode.next(null);
      return;
    }

    if (!this.draw) {
      this.draw = this.mapUtils.addPolygonDraw(loadedMap);
    }
    this.mapUtils.changeDrawMode(this.draw, mode);

    this.drawMode.next(this.draw.getMode());
  }

  @Output()
  public readonly polygonDrawDelete = new EventEmitter<void>();

  @Output()
  public readonly polygonDrawChange =
  new EventEmitter<LatLng[] | null>();

  private subscribeChangeDrawMode(): Subscription[] {
    const deleteSubscription = this.polygonDrawDelete.subscribe(() => {
      if (this.drawMode.value === 'static') { return; }

      this.draw?.changeMode('draw_polygon');
      this.drawMode.next('draw_polygon');
    });

    const modeChangeSubscription = this.drawMode.pipe(
      filter(mode => mode === 'simple_select'),
      filter(() => !this.draw?.getAll().features.length),
    ).subscribe(() => {
      this.draw?.changeMode('draw_polygon');
      this.drawMode.next('draw_polygon');
    });

    return [deleteSubscription, modeChangeSubscription];
  }

  private onPolygonChange(
    polygon?: GeoJSON.Feature<GeoJSON.Polygon>,
  ): void {
    if (!polygon) {
      this.polygonDrawChange.emit(undefined);
      return;
    }

    const latLngPolygon = polygon.geometry.coordinates[0].map(
      coords => ({
        lat: coords[1],
        lng: coords[0],
      }),
    );

    this.polygonDrawChange.emit(latLngPolygon);
  }

  // #endregion


  // #region Marker layer

  private markerLayers: MarkerLayer[] = [];

  @Input()
  public set markerLayerSources(sources: MarkerLayerSource[] | null) {
    const updateSources = sources ?? [];

    if (!this.map || !this.mapIsLoaded) {
      this.loadCallbacks.push(() => this.updateMarkerLayers(updateSources));
      return;
    }

    this.updateMarkerLayers(updateSources);
  }

  private updateMarkerLayers(sources: MarkerLayerSource[]): void {
    if (!this.map || !this.mapIsLoaded) {
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

  @Output()
  public readonly markerLayerLoad = this.sourceLoad.pipe(
    filter(sourceId => sourceId === _.last(this.markerLayers)?.id),
  );

  // #endregion


  // #region Heatmap

  private heatmapIds: string[] = [];

  @Input()
  public set heatmaps(sources: Heatmap[] | null) {
    const updateSources = sources ?? [];

    if (!this.map || !this.mapIsLoaded) {
      this.loadCallbacks.push(() => this.updateHeatmaps(updateSources));
      return;
    }

    this.updateHeatmaps(updateSources);
  }

  private updateHeatmaps(sources: Heatmap[]): void {
    if (!this.map || !this.mapIsLoaded) {
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

  @Output()
  public readonly heatmapLoad = this.sourceLoad.pipe(
    filter(sourceId => sourceId === _.last(this.heatmapIds)),
  );

  // #endregion


  // #region Popups

  private popupsOnMap: mapboxgl.Popup[] = [];

  @Input()
  public set popups(sources: PopupSource[] | null) {
    const updateSources = sources ?? [];

    if (!this.map || !this.mapIsLoaded) {
      this.loadCallbacks.push(() => this.updatePopups(updateSources));
      return;
    }

    this.updatePopups(updateSources);
  }

  private updatePopups(sources: PopupSource[]): void {
    if (!this.map || !this.mapIsLoaded) {
      throw new Error('Cannot update popups: map is not loaded');
    }
    const loadedMap = this.map;

    this.mapUtils.removePopups(this.popupsOnMap);
    this.popupsOnMap = [];

    this.popupsOnMap = this.mapUtils.addPopups(loadedMap, sources);
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
