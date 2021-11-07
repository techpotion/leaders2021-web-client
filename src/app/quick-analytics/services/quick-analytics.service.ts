import { Injectable } from '@angular/core';

import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import * as turf from '@turf/turf';

import { LatLng } from '../../map/models/lat-lng';
import { MapModeService } from '../../map/services/map-mode.service';


const KILOMETERS_IN_METER = 0.001;

@Injectable()
export class QuickAnalyticsService {

  constructor(
    private readonly mapMode: MapModeService,
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
        { steps: 32 },
      );
      return circle.geometry.coordinates[0].map(coordinate => ({
        lat: coordinate[1],
        lng: coordinate[0],
      }));
    }),
  );

}
