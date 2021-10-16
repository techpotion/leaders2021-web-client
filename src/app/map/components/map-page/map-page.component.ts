import { Component, ChangeDetectionStrategy } from '@angular/core';

import { of, BehaviorSubject, Observable } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';

import { PopulationApiService } from '../../../population/services/population-api.service';
import { SportObjectsApiService } from '../../../sport-objects/services/sport-objects-api.service';

import { Heatmap } from '../../models/heatmap';


type MapMode = 'default' | 'population-heatmap' | 'sport-heatmap';

@Component({
  selector: 'tp-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPageComponent {

  constructor(
    public readonly populationApi: PopulationApiService,
    public readonly sportObjectsApi: SportObjectsApiService,
  ) { }

  public readonly loadingSubject = new BehaviorSubject<boolean>(false);

  public readonly mapModeSubject = new BehaviorSubject<MapMode>('default');

  public readonly heatmaps: Observable<Heatmap[] | null>
  = this.mapModeSubject.pipe(
    tap(() => this.loadingSubject.next(true)),
    switchMap(mode => {
      if (mode === 'population-heatmap') {
        return this.populationApi.getDensity().pipe(
          map(source => [this.createPopulationHeatmap(source)]),
        );
      }
      if (mode === 'sport-heatmap') {
        return this.sportObjectsApi.getDensity().pipe(
          map(source => [this.createSportObjectHeatmap(source)]),
        );
      }
      return of(null);
    }),
    tap(() => this.loadingSubject.next(false)),
  );

  public onPopulationTogglePress(pressed: boolean): void {
    const mapModeUpdate = pressed ? 'population-heatmap' : 'default';
    this.mapModeSubject.next(mapModeUpdate);
  }

  public onSportObjectsTogglePress(pressed: boolean): void {
    const mapModeUpdate = pressed ? 'sport-heatmap' : 'default';
    this.mapModeSubject.next(mapModeUpdate);
  }

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

}
