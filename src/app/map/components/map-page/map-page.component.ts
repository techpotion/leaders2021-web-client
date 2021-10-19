import {
  Component,
  ChangeDetectionStrategy,
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
import { filter, map, tap, switchMap, pairwise } from 'rxjs/operators';
import _ from 'lodash';

import { PopulationApiService } from '../../../population/services/population-api.service';
import { SportObjectsApiService } from '../../../sport-objects/services/sport-objects-api.service';

import { Heatmap } from '../../models/heatmap';
import { MarkerLayerSource } from '../../models/marker-layer';
import { SportObject } from '../../../sport-objects/models/sport-object';


type MapMode = 'marker' | 'population-heatmap' | 'sport-heatmap';

@Component({
  selector: 'tp-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPageComponent implements OnDestroy {

  constructor(
    public readonly populationApi: PopulationApiService,
    public readonly sportObjectsApi: SportObjectsApiService,
  ) {
    this.subscriptions.push(
      ...this.subscribeOnMapModeChange(),
    );
  }

  public readonly subscriptions: Subscription[] = [];

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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

  public readonly markerLayers:
  Observable<MarkerLayerSource[] | null>
  = this.mapModeSubject.pipe(
    pairwise(),
    filter(([prev, curr]) =>
      _.difference(prev, curr).includes('marker')
      || _.difference(curr, prev).includes('marker'),
    ),
    tap(() => {
      const currentLoadingState = { ...this.loadingSubject.value };
      currentLoadingState.marker = true;
      this.loadingSubject.next(currentLoadingState);
    }),
    switchMap(([prev, curr]) => {
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

  public onTogglePress(pressed: boolean, mode: MapMode): void {
    if (pressed) {
      this.mapModeAdd.next(mode);
    } else {
      this.mapModeRemove.next(mode);
    }
  }

  public readonly isMarkerTogglePressed = this.mapModeSubject.pipe(
    map(modes => modes.includes('marker')),
  );

  public readonly isPopulationTogglePressed = this.mapModeSubject.pipe(
    map(modes => modes.includes('population-heatmap')),
  );

  public readonly isSportObjectsTogglePressed = this.mapModeSubject.pipe(
    map(modes => modes.includes('sport-heatmap')),
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

}
