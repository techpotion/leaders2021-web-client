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
  Observable,
  Subject,
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
import { SportObjectFilterService } from '../../../sport-objects/services/sport-object-filter.service';

import { Heatmap } from '../../models/heatmap';
import { MarkerLayerSource } from '../../models/marker-layer';
import { SportObject } from '../../../sport-objects/models/sport-object';
import {
  SportObjectFilterRequest,
  isFilterRequestEmpty,
} from '../../../sport-objects/models/sport-object-filter';


type MapMode = 'marker'
  | 'population-heatmap'
  | 'sport-heatmap'
  | 'polygon-draw';

@Component({
  selector: 'tp-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPageComponent implements OnDestroy, OnInit {

  constructor(
    public readonly populationApi: PopulationApiService,
    public readonly sportObjectsApi: SportObjectsApiService,
    public readonly sportObjectsFilter: SportObjectFilterService,
  ) {
    this.subscriptions.push(
      ...this.subscribeOnMapModeChange(),
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
  ]).pipe(
    tap(() => {
      const currentLoadingState = { ...this.loadingSubject.value };
      currentLoadingState.marker = true;
      this.loadingSubject.next(currentLoadingState);
    }),
    switchMap(([[prev, curr], filter]) => {
      if (!isFilterRequestEmpty(filter)) {
        return this.sportObjectsApi.getFilteredObjectsGeoJson(filter).pipe(
          map(source => [this.createSportObjectMarkerLayer(source)]),
        );
      }
      if (_.difference(curr, prev).includes('marker')) {
        return this.sportObjectsApi.getObjectsGeoJson().pipe(
          map(source => [this.createSportObjectMarkerLayer(source)]),
        );
      }
      return of(null);
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
