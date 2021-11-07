import { Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as turf from '@turf/turf';

import { LatLng } from '../../map/models/lat-lng';
import { PopupSource } from '../../map/models/popup';
import { MapModeService } from '../../map/services/map-mode.service';
import { MapUtilsService } from '../../map/services/map-utils.service';
import { MapLoadingService } from '../../map/services/map-loading.service';
import { FullPolygonAnalytics } from '../../polygon-saving/models/polygon-sport-analytics';
import { QuickAnalyticsInfoComponent } from '../components/quick-analytics-info/quick-analytics-info.component';


const KILOMETERS_IN_METER = 0.001;

@Injectable()
export class QuickAnalyticsService {

  constructor(
    private readonly mapMode: MapModeService,
    private readonly mapUtils: MapUtilsService,
    private readonly mapLoading: MapLoadingService,
  ) { }

  public readonly center = new BehaviorSubject<LatLng | null>(null);

  public readonly radius = new BehaviorSubject<number | null>(null);

  public readonly polygon = combineLatest([
    this.center,
    this.radius,
  ]).pipe(
    map(([center, radius]) => {
      if (!center || !radius) { return null; }
      if (!this.mapMode.modes.includes('quick-analytics')) { return null; }

      const circle = turf.circle(
        [center.lng, center.lat],
        radius * KILOMETERS_IN_METER,
      );
      return circle.geometry.coordinates[0].map(coordinate => ({
        lat: coordinate[1],
        lng: coordinate[0],
      }));
    }),
  );

}
