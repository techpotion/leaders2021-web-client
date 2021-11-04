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
import { MapUtilsService } from '../../services/map-utils.service';
import { MapLoadingService } from '../../services/map-loading.service';
import { MapModeService, MapMode } from '../../services/map-mode.service';
import { createScaleIncreaseAnimation } from '../../../shared/utils/create-scale-increase-animation';

import { PolygonDrawMode } from '../../services/map.service';
import { Heatmap } from '../../models/heatmap';
import { LatLng } from '../../models/lat-lng';
import { MarkerLayerSource } from '../../models/marker-layer';
import { SportObject, SportArea } from '../../../sport-objects/models/sport-object';
import { FullPolygonAnalytics } from '../../../polygon-saving/models/polygon-sport-analytics';
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
  ],
})
export class MapPageComponent implements OnDestroy, OnInit {

  constructor(
    public readonly cd: ChangeDetectorRef,
    public readonly mapUtils: MapUtilsService,
    public readonly loading: MapLoadingService,
    public readonly mode: MapModeService,
    public readonly populationApi: PopulationApiService,
    public readonly sportAnalyticsApi: SportAnalyticsApiService,
    public readonly sportObjectsApi: SportObjectsApiService,
    public readonly sportObjectsFilter: SportObjectFilterService,
    public readonly sportPolygonApi: SportPolygonApiService,
  ) {
    this.subscriptions.push(
      this.subscribeClearingPolygon(),
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


  // #region Popups

  private readonly forcePopups = new BehaviorSubject<PopupSource[]>([]);

  public readonly popups = merge(
    this.forcePopups,
    combineLatest([
      this.polygonSelection,
      this.mode.contentObservable,
    ]).pipe(
      map(([polygon, content]) => {
        if (!polygon) { return null; }
        if ((this.mode.modes.includes('polygon-draw')
          || this.mode.modes.includes('polygon-saving'))
          && !content.includes('polygon-dashboard')) {
          return polygon;
        }
        return null;
      }),
      switchMap(polygon => {
        this.loading.toggle('analytics', false);
        if (!polygon) { return of(null); }

        this.loading.toggle('analytics', true);
        return combineLatest(
          this.sportAnalyticsApi.getPolygonAnalytics(polygon),
          this.sportObjectsApi.getFilteredAreas(
            { polygon: { points: polygon } },
          ),
        ).pipe(
          tap(() => this.loading.toggle('analytics', false)),
          map(([analytics, areas]) => ({
            position: this.mapUtils.getMostLeftPoint(polygon),
            component: SportAreaBriefInfoComponent,
            initMethod: (component: SportAreaBriefInfoComponent) => {
              component.polygon = polygon;
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
                  switchMap(() => combineLatest([
                    this.sportObjectsApi.getObjects(
                      { polygon: { points: polygon } },
                    ),
                    this.sportAnalyticsApi.getFullPolygonAnalytics(polygon),
                  ])),
                  tap(() => this.loading.toggle('analytics', false)),
                ).subscribe(([objects, analytics]) => {
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
  );

  private polygonSubscriptions: Subscription[] = [];

  // #endregion Popups


  // #region Dashboard

  public readonly dashboardAnalytics =
  new BehaviorSubject<FullPolygonAnalytics | null>(null);

  public readonly dashboardObjects = new BehaviorSubject<SportObject[]>([]);

  public readonly dashboardAreas = new BehaviorSubject<SportArea[]>([]);

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

  public readonly singleAvailabilityChosen = this.filterRequest.pipe(
    map(request => request.availabilities?.length ?? 0),
    map(availabilityLength => availabilityLength === 1),
  );

  // #endregion


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
        selection, filter.availabilities![0],
      ).pipe(
        map(geojson => [{ polygon: geojson, color: '#A0D89B', opacity: 0.5 }]),
      );
    }),
  );


  // #region Markers

  public readonly markerLayers: Observable<MarkerLayerSource[] | null> =
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
