import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import {
  of,
  BehaviorSubject,
  combineLatest,
  merge,
  Observable,
  Subscription,
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

import { PopulationApiService } from '../../../population/services/population-api.service';
import { SportObjectsApiService } from '../../../sport-objects/services/sport-objects-api.service';
import { SportAnalyticsApiService } from '../../../sport-objects/services/sport-analytics-api.service';
import { SportObjectFilterService } from '../../../sport-objects/services/sport-object-filter.service';
import { SportPolygonApiService } from '../../../polygon-saving/services/sport-polygon-api.service';
import { PointApiService } from '../../../sport-objects/services/point-api.service';
import { MapUtilsService } from '../../services/map-utils.service';
import { MapLoadingService } from '../../services/map-loading.service';
import { MapModeService, MapMode } from '../../services/map-mode.service';
import { createScaleIncreaseAnimation } from '../../../shared/utils/create-scale-increase-animation';
import { isNotNil } from '../../../shared/utils/is-not-nil';
import { QuickAnalyticsService } from '../../../quick-analytics/services/quick-analytics.service';
import { convertToAnalyticsRequest } from '../../../sport-objects/utils/convert-to-analytics-request';

import { PolygonDrawMode } from '../../services/map.service';
import { Heatmap } from '../../models/heatmap';
import { LatLng } from '../../models/lat-lng';
import { MarkerLayerSource } from '../../models/marker-layer';
import { SportObject, SportArea } from '../../../sport-objects/models/sport-object';
import { FullPolygonAnalytics } from '../../../polygon-saving/models/polygon-sport-analytics';
import { QuickAnalyticsInfoComponent } from '../../../quick-analytics/components/quick-analytics-info/quick-analytics-info.component';
import {
  SportObjectFilterRequest,
  isFilterRequestEmpty,
  isFilterEnabled,
} from '../../../sport-objects/models/sport-object-filter';
import { MapEvent } from '../../models/map-event';
import { PopupSource } from '../../models/popup';

import { SportObjectBriefInfoComponent } from
  '../../../sport-objects/components/sport-object-brief-info/sport-object-brief-info.component';
import { SportAreaBriefInfoComponent } from
  '../../../sport-objects/components/sport-area-brief-info/sport-area-brief-info.component';
import { SportAreaDashboardComponent } from
  '../../../sport-objects/components/sport-area-dashboard/sport-area-dashboard.component';


const POLYGON_SAVING_BOUNDS_PADDING = {
  top: 110,
  right: 670,
  bottom: 0,
  left: 0,
};

@Component({
  selector: 'tp-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    createScaleIncreaseAnimation(),
  ],
  providers: [
    MapLoadingService,
    MapModeService,
    QuickAnalyticsService,
  ],
})
export class MapPageComponent implements OnDestroy, OnInit {

  constructor(
    public readonly cd: ChangeDetectorRef,
    public readonly mapUtils: MapUtilsService,
    public readonly loading: MapLoadingService,
    public readonly mode: MapModeService,
    public readonly pointApi: PointApiService,
    public readonly populationApi: PopulationApiService,
    public readonly sportAnalyticsApi: SportAnalyticsApiService,
    public readonly sportObjectsApi: SportObjectsApiService,
    public readonly sportObjectsFilter: SportObjectFilterService,
    public readonly sportPolygonApi: SportPolygonApiService,
    public readonly quickAnalytics: QuickAnalyticsService,
  ) {
    this.subscriptions.push(
      this.subscribeClearingPolygon(),
      this.subscribeAnalyticsDownload(),
    );
  }

  public readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngOnInit(): void {
    this.loading.toggle('map', true);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // #endregion


  // #region Map content

  public readonly fullInfoObject = new BehaviorSubject<{
    obj: SportObject;
    areas: SportArea[];
  } | undefined>(undefined);

  public fullInfoObjectSubscription?: Subscription;

  // #endregion


  // #region Map mode

  public onTogglePress(pressed: boolean, mode: MapMode): void {
    if (pressed) {
      this.mode.add(mode);
    } else {
      this.mode.remove(mode);
    }
  }

  public readonly isObjectIntersectionTogglePressed =
  this.mode.modeObservable.pipe(
    map(modes => modes.includes('object-intersection')),
  );

  // #endregion


  // #region Map events

  public readonly mapEvent = new BehaviorSubject<MapEvent | null>(null);

  // #endregion


  // #region Heatmaps

  public readonly heatmaps: Observable<Heatmap[] | null>
  = this.mode.modeObservable.pipe(
    pairwise(),
    filter(([prev, curr]) =>
      _.difference(prev, curr).includes('population-heatmap')
      || _.difference(curr, prev).includes('population-heatmap')
      || _.difference(prev, curr).includes('sport-heatmap')
      || _.difference(curr, prev).includes('sport-heatmap'),
    ),
    switchMap(([, curr]) => {
      const heatmapObservables: Observable<Heatmap>[] = [];
      if (curr.includes('population-heatmap')) {
        this.loading.toggle('heatmap', true);
        heatmapObservables.push(
          this.populationApi.getDensity().pipe(
            map(source => this.createPopulationHeatmap(source)),
          ),
        );
      }
      if (curr.includes('sport-heatmap')) {
        this.loading.toggle('heatmap', true);
        heatmapObservables.push(
          this.sportObjectsApi.getObjectsGeoJson().pipe(
            map(source => this.createSportObjectHeatmap(source)),
          ),
        );
      }

      if (!heatmapObservables.length) { return of(null); }
      return combineLatest<Heatmap[]>(heatmapObservables);
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


  // #region Mouse events

  public readonly mapMouseMove = new BehaviorSubject<{
    point: LatLng;
    mouse: { x: number; y: number };
  } | null>(null);

  public readonly mousePosition = this.mapMouseMove.pipe(
    filter(isNotNil),
    map(mouseEvent => mouseEvent.mouse),
  );

  public readonly mouseDensityEnabled = this.mode.modeObservable.pipe(
    map(modes =>
      (modes.includes('sport-heatmap')
        || modes.includes('population-heatmap'))
        && !modes.includes('marker')
        && !modes.includes('polygon-draw')
        && !modes.includes('polygon-saving')
        && !modes.includes('object-intersection'),
    ),
  );

  public readonly pointPopulationDensity = combineLatest([
    this.mapMouseMove.pipe(
      filter(isNotNil),
    ),
    this.mode.modeObservable,
    this.mouseDensityEnabled,
  ]).pipe(
    switchMap(([moveEvent, modes, enabled]) => {
      if (!modes.includes('population-heatmap') || !enabled) {
        return of(null);
      }
      return this.pointApi.getPopulationDensity(moveEvent.point);
    }),
  );

  public readonly pointObjectsDensity = combineLatest([
    this.mapMouseMove.pipe(
      filter(isNotNil),
    ),
    this.mode.modeObservable,
    this.mouseDensityEnabled,
  ]).pipe(
    switchMap(([moveEvent, modes, enabled]) => {
      if (!modes.includes('sport-heatmap') || !enabled) {
        return of(null);
      }
      return this.pointApi.getObjectsDensity(moveEvent.point);
    }),
  );

  // #endregion


  // #region Bounds

  @ViewChild('dashboard')
  public dashboardComponent!: SportAreaDashboardComponent;

  public readonly mapBoundsPadding = this.mode.contentObservable.pipe(
    map(content => {
      if (content.includes('polygon-saving')) {
        return POLYGON_SAVING_BOUNDS_PADDING;
      }
      if (content.includes('polygon-dashboard')) {
        return {
          top: 110,
          bottom: 0,
          left: 0,
          right: this.dashboardComponent.el.nativeElement.offsetWidth,
        };
      }
      return null;
    }),
  );

  // #endregion


  // #region Polygon selection

  public readonly polygonDrawMode: Observable<PolygonDrawMode | null> =
  combineLatest([
    this.mode.modeObservable,
    this.mode.contentObservable,
  ]).pipe(
    switchMap(([modes, content]) => {
      if (modes.includes('polygon-draw')) {
        if (content.includes('polygon-dashboard')) {
          return of('read' as const);
        }
        return of('draw' as const);
      }
      if (modes.includes('polygon-saving')) {
        return this.settingsAwaitingPolygon.pipe(
          map(value => value
            ? 'draw' as const
            : 'read' as const),
        );
      }
      return of(null);
    }),
    tap(() => this.cd.detectChanges()),
  );

  public readonly polygonSelection =
  new BehaviorSubject<LatLng[] | null>(null);

  public readonly settingsAwaitingPolygon =
  new BehaviorSubject<boolean>(false);

  private subscribeClearingPolygon(): Subscription {
    return this.settingsAwaitingPolygon.pipe(
      filter(isAwaiting => isAwaiting),
    ).subscribe(() => this.mapEvent.next({ event: 'clear-polygon' }));
  }

  public readonly newPolygon = this.settingsAwaitingPolygon.pipe(
    filter(isAwaiting => isAwaiting),
    switchMap(() => this.polygonSelection),
  );

  public readonly forcePolygon =
  new BehaviorSubject<LatLng[] | null>(null);

  public readonly polygonEvent =
  new BehaviorSubject<{ event: 'clear' | 'undefined' }>({
    event: 'undefined',
  });

  // #endregion


  // #region Download

  public readonly analyticsDownload = new BehaviorSubject<boolean>(false);

  private subscribeAnalyticsDownload(): Subscription {
    return this.analyticsDownload.subscribe(downloading =>
      this.loading.toggle('download', downloading));
  }

  // #endregion


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

  public readonly filtersEnabled = this.filterRequest.pipe(
    map(request => isFilterEnabled(request)),
  );

  public readonly singleAvailabilityChosen = this.filterRequest.pipe(
    map(request => request.availabilities?.length ?? 0),
    map(availabilityLength => availabilityLength === 1),
  );

  // #endregion


  // #region Popups

  private readonly forcePopups = new BehaviorSubject<PopupSource[]>([]);

  public readonly popups = merge(
    this.forcePopups,
    combineLatest([
      this.quickAnalytics.polygon,
      this.mode.contentObservable,
      this.filterRequest,
    ]).pipe(
      map(([polygon, content, filters]) => {
        if (!polygon) { return null; }
        if (!content.includes('quick-analytics')) { return null; }
        return { polygon, filters };
      }),
      map(request => request === null ? request : ({
        analyticsRequest: convertToAnalyticsRequest(
          request.filters,
          request.polygon,
        ),
        filterRequest: request.filters,
      })),
      switchMap(request => {
        this.loading.toggle('analytics', false);
        if (!request) { return of(null); }

        this.loading.toggle('analytics', true);
        return this.sportAnalyticsApi.getFullPolygonAnalytics(
          request.analyticsRequest,
        ).pipe(
          map(analytics => ({
            analytics,
            polygon: request.analyticsRequest.polygon?.points,
            filtersEnabled: isFilterEnabled(request.filterRequest),
          })),
          tap(() => this.loading.toggle('analytics', false)),
          map(({ analytics, polygon, filtersEnabled }) => {
            if (!polygon) {
              throw new Error('New error');
            }
            return { analytics, polygon, filtersEnabled };
          }),
          map(({ analytics, polygon, filtersEnabled }) => ({
            position: this.mapUtils.getMostLeftPoint(polygon),
            component: QuickAnalyticsInfoComponent,
            initMethod: (component: QuickAnalyticsInfoComponent) => {
              component.analytics = analytics;
              component.filtersEnabled = filtersEnabled;
            },
            eventHandler: (component: QuickAnalyticsInfoComponent) => {
              if (this.polygonSubscriptions.length) {
                this.polygonSubscriptions.forEach(sub => sub.unsubscribe());
                this.polygonSubscriptions = [];
              }

              this.polygonSubscriptions.push(
                component.openFull.pipe(
                  tap(() => this.loading.toggle('analytics', true)),
                  switchMap(() => combineLatest([
                    this.sportObjectsApi.getObjects(
                      { polygon: { points: polygon } },
                    ),
                    this.sportObjectsApi.getFilteredAreas(
                      { polygon: { points: polygon } },
                    ),
                  ])),
                  tap(() => this.loading.toggle('analytics', false)),
                ).subscribe(([objects, areas]) => {
                  this.dashboardObjects.next(objects);
                  this.dashboardAnalytics.next(analytics);
                  this.dashboardAreas.next(areas);
                  this.mode.addContent('polygon-dashboard');
                  this.forcePopups.next([]);
                }),
              );
            },
            anchor: 'right' as const,
            closeOnClick: false,
          })),
          map(popup => [popup]),
        );
      }),
    ),
    combineLatest([
      this.polygonSelection,
      this.mode.contentObservable,
      this.filterRequest,
    ]).pipe(
      map(([polygon, content, filters]) => {
        if (!polygon) { return null; }
        if ((this.mode.modes.includes('polygon-draw')
          || this.mode.modes.includes('polygon-saving'))
          && !content.includes('polygon-dashboard')) {
          return { polygon, filters };
        }
        return null;
      }),
      map(request => request === null
        ? request
        : convertToAnalyticsRequest(request.filters, request.polygon)),
      switchMap(request => {
        this.loading.toggle('analytics', false);
        if (!request) { return of(null); }

        this.loading.toggle('analytics', true);
        return combineLatest(
          this.sportAnalyticsApi.getPolygonAnalytics(request),
          this.sportObjectsApi.getFilteredAreas(
            { polygon: request.polygon },
          ),
        ).pipe(
          tap(() => this.loading.toggle('analytics', false)),
          map(([analytics, areas]) => ({
            position: this.mapUtils.getMostLeftPoint(
              // eslint-disable-next-line
              (request as any).polygon.points,
            ),
            component: SportAreaBriefInfoComponent,
            initMethod: (component: SportAreaBriefInfoComponent) => {
              component.filters = request;
              component.analytics = analytics;
              component.areas = areas;
              if (this.mode.modes.includes('polygon-saving')) {
                component.savedState.next('saved');
              }
            },
            eventHandler: (component: SportAreaBriefInfoComponent) => {
              if (this.polygonSubscriptions.length) {
                this.polygonSubscriptions.forEach(sub => sub.unsubscribe());
                this.polygonSubscriptions = [];
              }

              this.polygonSubscriptions.push(
                component.clearSelection.subscribe(() => {
                  this.mapEvent.next({ event: 'clear-polygon' });
                  this.polygonEvent.next({ event: 'clear' });
                }),

                component.openFull.pipe(
                  tap(() => this.loading.toggle('analytics', true)),
                  switchMap(filters => combineLatest([
                    this.sportObjectsApi.getObjects(
                      { polygon: filters.polygon },
                    ),
                    this.sportAnalyticsApi.getFullPolygonAnalytics(filters),
                  ])),
                  tap(() => this.loading.toggle('analytics', false)),
                ).subscribe(([objects, analytics]) => {
                  this.dashboardObjects.next(objects);
                  this.dashboardAnalytics.next(analytics);
                  this.dashboardAreas.next(areas);
                  this.mode.addContent('polygon-dashboard');
                  this.forcePopups.next([]);
                }),

                component.analyticsDownload.subscribe(downloading =>
                  this.analyticsDownload.next(downloading)),
              );
            },
            anchor: 'right' as const,
            closeOnClick: false,
          })),
          map(popup => [popup]),
        );
      }),
    ),
  );

  private polygonSubscriptions: Subscription[] = [];

  // #endregion Popups


  // #region Dashboard

  public readonly dashboardAnalytics =
  new BehaviorSubject<FullPolygonAnalytics | null>(null);

  public readonly dashboardObjects = new BehaviorSubject<SportObject[]>([]);

  public readonly dashboardAreas = new BehaviorSubject<SportArea[]>([]);

  // #endregion

  /* eslint-disable */
  public readonly polygonSources = combineLatest([
    this.polygonSelection,
    this.mode.modeObservable,
    this.filterRequest,
  ]).pipe(
    switchMap(([selection, mode, filter]) => {
      if (!selection
        || !mode.includes('object-intersection')
        || (filter.availabilities?.length ?? 0) !== 1) {
        return of(null);
      }
      return this.sportPolygonApi.getIntersections(
        selection,
        filter.availabilities![0],
        filter.sportKinds!,
        filter.departmentalOrganizationNames!,
        filter.sportsAreaNames!,
        filter.sportsAreaTypes!,
      ).pipe(
        map((geojsons) => {
          const result = []
          for (const geojson of geojsons)
            result.push({ polygon: geojson, color: this.randomizeColor(), opacity: 0.5 })
          return result
        }),
      );
    }),
  );

  private randomizeColor(): string {
    return '#' + Math.floor(Math.random()*16777215).toString(16)
  }
  /* eslint-enable */

  // #region Markers

  public readonly markerLayers: Observable<MarkerLayerSource[] | null> = merge(
    combineLatest([
      this.quickAnalytics.center,
      this.mode.contentObservable,
    ]).pipe(
      map(([center, content]) => {
        if (!center) { return null; }
        if (!content.includes('quick-analytics')) { return null; }
        return center;
      }),
      map(center => center === null ? center : ([{
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [center.lat, center.lng],
            },
            properties: null,
          }],
        },
        // eslint-disable-next-line
        idMethod: (obj: any) => 0,
        image: {
          source: 'assets/unknown-marker.svg',
          anchor: 'bottom' as const,
        },
        className: 'quick-analysis-marker',
        cluster: {
          background: '#193C9D',
          color: '#FFFFFF',
        },
      }])),
    ),
    combineLatest([
      this.mode.modeObservable.pipe(
        pairwise(),
        filter(([prev, curr]) =>
          _.difference(prev, curr).includes('marker')
          || _.difference(curr, prev).includes('marker'),
        ),
        startWith([this.mode.modes, this.mode.modes]),
      ),
      this.filterRequest,
      this.polygonSelection,
    ]).pipe(
      switchMap(([[prev, curr], filter, polygon]) => {
        if (!isFilterRequestEmpty(filter)) {
          this.loading.toggle('marker', true);
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
          this.loading.toggle('marker', true);
          return this.sportObjectsApi.getObjectsGeoJson().pipe(
            map(source => [this.createSportObjectMarkerLayer(source)]),
          );
        }

        if (polygon) {
          this.loading.toggle('marker', true);
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
                tap(() => this.loading.toggle('data', true)),
                switchMap(objectId => this.sportObjectsApi.getFilteredAreas({
                  objectIds: [objectId],
                })),
                map(areas => ({ obj, areas })),
                tap(() => this.loading.toggle('data', false)),
              ).subscribe(obj => {
                this.mode.addContent('object-info');
                this.fullInfoObject.next(obj);
              });
            },
          };
        }
        return sources;
      }),
      tap(() => setTimeout(() => this.cd.detectChanges())),
    ),
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
