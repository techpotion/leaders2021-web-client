import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';

import {
  of,
  BehaviorSubject,
  combineLatest,
  merge,
  Observable,
  Subject,
  Subscription,
  zip,
} from 'rxjs';
import {
  filter,
  map,
  tap,
  startWith,
  switchMap,
  pairwise,
} from 'rxjs/operators';
import _ from 'lodash';
import mapboxgl from 'mapbox-gl';

import { PopulationApiService } from '../../../population/services/population-api.service';
import { SportObjectsApiService } from '../../../sport-objects/services/sport-objects-api.service';
import { SportAnalyticsApiService } from '../../../sport-objects/services/sport-analytics-api.service';
import { SportObjectFilterService } from '../../../sport-objects/services/sport-object-filter.service';
import { MapUtilsService } from '../../services/map-utils.service';
import { isNotNil } from '../../../shared/utils/is-not-nil';

import { Heatmap } from '../../models/heatmap';
import { LatLng } from '../../models/lat-lng';
import { MarkerLayerSource } from '../../models/marker-layer';
import { SportObject, SportArea } from '../../../sport-objects/models/sport-object';
import {
  SportObjectFilterRequest,
  isFilterRequestEmpty,
} from '../../../sport-objects/models/sport-object-filter';
import { MapEvent } from '../../models/map-event';
import { PopupSource } from '../../models/popup';

import { SportObjectBriefInfoComponent } from
  '../../../sport-objects/components/sport-object-brief-info/sport-object-brief-info.component';
import { SportAreaBriefInfoComponent } from
  '../../../sport-objects/components/sport-area-brief-info/sport-area-brief-info.component';


type MapMode = 'marker'
| 'population-heatmap'
| 'sport-heatmap'
| 'polygon-draw';

type MapContent = 'object-info' | 'analysis' | 'polygon-saving';

@Component({
  selector: 'tp-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPageComponent implements OnDestroy, OnInit {

  constructor(
    public readonly mapUtils: MapUtilsService,
    public readonly populationApi: PopulationApiService,
    public readonly sportAnalyticsApi: SportAnalyticsApiService,
    public readonly sportObjectsApi: SportObjectsApiService,
    public readonly sportObjectsFilter: SportObjectFilterService,
  ) {
    this.subscriptions.push(
      ...this.subscribeOnMapModeChange(),
      this.subscribeOnNewPolygonName(),
      this.subscribeOnPolygonChoose(),
    );
  }

  public readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private readonly initSubject = new Subject<void>();

  public ngOnInit(): void {
    this.initSubject.next();
  }

  // #endregion


  // #region Loading spinners

  private readonly loadingSubject =
  new BehaviorSubject<{
    heatmap: boolean;
    marker: boolean;
  }>({
    heatmap: false,
    marker: false,
  });

  public readonly loadingShown = this.loadingSubject.pipe(
    map(loading => loading.heatmap || loading.marker),
  );

  // #endregion


  // #region Map content

  public readonly mapContentSubject =
  new BehaviorSubject<MapContent | undefined>(undefined);

  public readonly fullInfoObject = new BehaviorSubject<{
    obj: SportObject;
    areas: SportArea[];
  } | undefined>(undefined);

  public fullInfoObjectSubscription?: Subscription;

  // #endregion


  // #region Map mode

  private readonly mapModeAdd = new Subject<MapMode>();

  private readonly mapModeRemove = new Subject<MapMode>();

  public readonly mapModeSubject = new BehaviorSubject<MapMode[]>([]);

  private subscribeOnMapModeChange(): Subscription[] {
    const removeSub = this.mapModeRemove.subscribe(mode => {
      const newModes = this.mapModeSubject.value.filter(
        existingMode => mode !== existingMode,
      );
      this.mapModeSubject.next(newModes);
    });

    const addSub = this.mapModeAdd.subscribe(mode => {
      if (this.mapModeSubject.value.includes(mode)) {
        return;
      }
      const newModes = [ ...this.mapModeSubject.value ];
      newModes.push(mode);
      this.mapModeSubject.next(newModes);
    });

    return [removeSub, addSub];
  }

  public onTogglePress(pressed: boolean, mode: MapMode): void {
    if (pressed) {
      this.onMapModeAdd(mode);
      this.mapModeAdd.next(mode);
    } else {
      this.mapModeRemove.next(mode);
    }
  }

  public onPolygonTogglePress(pressed: boolean): void {
    if (pressed) {
      this.mapContentSubject.next('polygon-saving');
    } else {
      this.mapContentSubject.next(undefined);
    }
  }

  public readonly isPolygonDrawTogglePressed = this.mapModeSubject.pipe(
    map(modes => modes.includes('polygon-draw')),
  );

  public readonly isMarkerTogglePressed = this.mapModeSubject.pipe(
    map(modes => modes.includes('marker')),
  );

  public readonly isPopulationTogglePressed = this.mapModeSubject.pipe(
    map(modes => modes.includes('population-heatmap')),
  );

  public readonly isSportObjectsTogglePressed = this.mapModeSubject.pipe(
    map(modes => modes.includes('sport-heatmap')),
  );

  private onMapModeAdd(mode: MapMode): void {
    if (mode === 'polygon-draw') {
      this.mapModeRemove.next('marker');
    } else if (mode === 'marker') {
      this.mapModeRemove.next('polygon-draw');
    }
  }

  // #endregion


  // #region Map events

  public readonly mapEvent = new BehaviorSubject<MapEvent | null>(null);

  // #endregion


  // #region Heatmaps

  public readonly heatmaps: Observable<Heatmap[] | null>
  = this.mapModeSubject.pipe(
    pairwise(),
    filter(([prev, curr]) =>
      _.difference(prev, curr).includes('population-heatmap')
      || _.difference(curr, prev).includes('population-heatmap')
      || _.difference(prev, curr).includes('sport-heatmap')
      || _.difference(curr, prev).includes('sport-heatmap'),
    ),
    tap(() => {
      const currentLoadingState = { ...this.loadingSubject.value };
      currentLoadingState.heatmap = true;
      this.loadingSubject.next(currentLoadingState);
    }),
    switchMap(([, curr]) => {
      const heatmapObservables: Observable<Heatmap>[] = [];
      if (curr.includes('population-heatmap')) {
        heatmapObservables.push(
          this.populationApi.getDensity().pipe(
            map(source => this.createPopulationHeatmap(source)),
          ),
        );
      }
      if (curr.includes('sport-heatmap')) {
        heatmapObservables.push(
          this.sportObjectsApi.getObjectsGeoJson().pipe(
            map(source => this.createSportObjectHeatmap(source)),
          ),
        );
      }
      if (!heatmapObservables.length) {
        return of(null);
      }
      return combineLatest<Heatmap[]>(heatmapObservables);
    }),
    tap(() => {
      const currentLoadingState = { ...this.loadingSubject.value };
      currentLoadingState.heatmap = false;
      this.loadingSubject.next(currentLoadingState);
    }),
  );

  private createPopulationHeatmap(
    geojson: GeoJSON.FeatureCollection,
  ): Heatmap {
    return {
      data: geojson,
      property: 'heatness',
      maxzoom: 16,
      radiusStops: [
        { zoom: 8, radius: 8 },
        { zoom: 9, radius: 16 },
        { zoom: 10, radius: 32 },
        { zoom: 11, radius: 64 },
        { zoom: 14, radius: 256 },
        { zoom: 18, radius: 512 },
      ],
    };
  }

  private createSportObjectHeatmap(
    geojson: GeoJSON.FeatureCollection,
  ): Heatmap {
    return {
      data: geojson,
      maxzoom: 16,
      radiusStops: [
        { zoom: 8, radius: 2 },
        { zoom: 9, radius: 4 },
        { zoom: 10, radius: 8 },
        { zoom: 11, radius: 16 },
        { zoom: 14, radius: 64 },
        { zoom: 16, radius: 128 },
        { zoom: 18, radius: 512 },
      ],
    };
  }

  // #endregion


  // #region Polygon selection

  public readonly polygonSelection =
  new BehaviorSubject<LatLng[] | undefined>(undefined);

  public readonly newPolygonName =
  new BehaviorSubject<string | null>(null);

  public subscribeOnNewPolygonName(): Subscription {
    return this.newPolygonName.subscribe(name => {
      this.mapEvent.next({ event: 'clear-polygon' });
      if (name) {
        this.onTogglePress(true, 'polygon-draw');
      }
    });
  }

  public readonly newPolygon = zip(
    this.polygonSelection.pipe(
      filter(isNotNil),
    ),
    this.newPolygonName.pipe(
      filter(isNotNil),
    ),
  ).pipe(
    switchMap(([points, name]) => combineLatest([
      this.sportObjectsApi.getFilteredAreas({ polygon: { points } }),
      this.sportAnalyticsApi.getPolygonAnalytics(points),
      of(points),
      of(name),
    ])),
    map(([areas, analytics, geometry, name]) =>
      ({ geometry, name, analytics, areas })),
  );

  public readonly chosenPolygon =
  new BehaviorSubject<LatLng[] | null>(null);

  public subscribeOnPolygonChoose(): Subscription {
    return this.chosenPolygon.subscribe(polygon => {
      if (polygon) {
        this.onTogglePress(true, 'polygon-draw');
        this.forcePolygon.next(polygon);
        return;
      }
      this.mapEvent.next({ event: 'clear-polygon' });
    });
  }

  public readonly forcePolygon =
  new BehaviorSubject<LatLng[] | null>(null);

  // #endregion


  // #region Popups

  private readonly forcePopups = new BehaviorSubject<PopupSource[]>([]);

  public readonly popups = merge(
    this.forcePopups,
    this.polygonSelection.pipe(
      filter(() => this.mapContentSubject.value !== 'polygon-saving'),
      switchMap(selection => {
        if (!selection) {
          return of(null);
        }
        return this.sportAnalyticsApi.getPolygonAnalytics(selection).pipe(
          map(analytics => ({
            position: this.mapUtils.getMostLeftPoint(selection),
            component: SportAreaBriefInfoComponent,
            initMethod: (component: SportAreaBriefInfoComponent) => {
              component.polygon = selection;
              component.analytics = analytics;
            },
            eventHandler: (component: SportAreaBriefInfoComponent) => {
              if (this.polygonSubscriptions.length) {
                this.polygonSubscriptions.forEach(sub => sub.unsubscribe());
                this.polygonSubscriptions = [];
              }

              this.polygonSubscriptions.push(
                component.clearSelection.subscribe(() => this.mapEvent.next(
                  { event: 'clear-polygon' },
                )),
                component.closeInfo.subscribe(() =>
                  this.forcePopups.next([])),
              );
            },
            anchor: 'right' as mapboxgl.Anchor,
            closeOnClick: false,
          })),
          map(popup => [popup]),
        );
      }),
    ),
  );

  private polygonSubscriptions: Subscription[] = [];

  // #endregion Popups


  // #region Marker filters

  public readonly markerFilterSources = combineLatest([
    this.sportObjectsFilter.createDepartmentalOrganizationNamesFilter(),
    this.sportObjectsFilter.createSportKindsFilter(),
    this.sportObjectsFilter.createSportAreaNamesFilter(),
    this.sportObjectsFilter.createSportAreaTypesFilter(),
    of(this.sportObjectsFilter.createSportObjectAvailabilityFilter()),
  ]);

  public readonly nameVariants = this.sportObjectsApi.getObjectNames();

  public readonly filterRequest =
  new BehaviorSubject<SportObjectFilterRequest>({});

  // #endregion


  // #region Markers

  public readonly markerLayers: Observable<MarkerLayerSource[] | null> =
  combineLatest([
    this.mapModeSubject.pipe(
      pairwise(),
      filter(([prev, curr]) =>
        _.difference(prev, curr).includes('marker')
        || _.difference(curr, prev).includes('marker'),
      ),
      startWith([this.mapModeSubject.value, this.mapModeSubject.value]),
    ),
    this.filterRequest,
    this.polygonSelection,
  ]).pipe(
    tap(() => {
      const currentLoadingState = { ...this.loadingSubject.value };
      currentLoadingState.marker = true;
      this.loadingSubject.next(currentLoadingState);
    }),
    switchMap(([[prev, curr], filter, polygon]) => {
      if (!isFilterRequestEmpty(filter)) {
        const polygonizedFilter = { ...filter };
        if (polygon) {
          polygonizedFilter.polygon = { points: polygon };
        }
        return this.sportObjectsApi.getFilteredObjectsGeoJson(
          polygonizedFilter,
        ).pipe(
          map(source => [this.createSportObjectMarkerLayer(source)]),
        );
      }

      if (_.difference(curr, prev).includes('marker')) {
        return this.sportObjectsApi.getObjectsGeoJson().pipe(
          map(source => [this.createSportObjectMarkerLayer(source)]),
        );
      }

      if (polygon) {
        return this.sportObjectsApi.getObjectsGeoJson(
          { polygon: { points: polygon } },
        ).pipe(
          map(source => [this.createSportObjectMarkerLayer(source)]),
        );
      }

      return of(null);
    }),
    map(sources => {
      if (!sources) { return sources; }
      for (const source of sources) {
        source.popup = {
          component: SportObjectBriefInfoComponent,
          initMethod: (
            component: SportObjectBriefInfoComponent,
            obj: SportObject,
          ) => {
            component.obj = obj;
          },
          eventHandler: (
            component: SportObjectBriefInfoComponent,
            obj: SportObject,
          ) => {
            if (this.fullInfoObjectSubscription
              && !this.fullInfoObjectSubscription.closed) {
              this.fullInfoObjectSubscription.unsubscribe();
            }

            this.fullInfoObjectSubscription = component.openFull.pipe(
              switchMap(objectId => this.sportObjectsApi.getFilteredAreas({
                objectIds: [objectId],
              })),
              map(areas => ({ obj, areas })),
            ).subscribe(obj => {
              this.mapContentSubject.next('object-info');
              this.fullInfoObject.next(obj);
            });
          },
        };
      }
      return sources;
    }),
    tap(() => {
      const currentLoadingState = { ...this.loadingSubject.value };
      currentLoadingState.marker = false;
      this.loadingSubject.next(currentLoadingState);
    }),
  );

  private createSportObjectMarkerLayer(
    geojson: GeoJSON.FeatureCollection<GeoJSON.Point, SportObject>,
  ): MarkerLayerSource {
    return {
      data: geojson,
      idMethod: (obj: SportObject) => obj.objectId,
      image: {
        source: 'assets/marker.svg',
        anchor: 'bottom',
      },
      className: 'marker',
      cluster: {
        background: '#193C9D',
        color: '#FFFFFF',
      },
    };
  }

  // #endregion

}
