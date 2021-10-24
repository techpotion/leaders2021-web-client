import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { LatLng } from '../../map/models/lat-lng';
import {
  FullPolygonAnalytics,
  PolygonSportAnalytics,
} from '../models/polygon-sport-analytics';


@Injectable({
  providedIn: 'root',
})
export class SportAnalyticsApiService {

  constructor(
    private readonly http: HttpClient,
  ) { }

  public getPolygonAnalytics(
    polygon: LatLng[],
  ): Observable<PolygonSportAnalytics> {
    return this.http.post<PolygonSportAnalytics>(
      '/PolygonAnalytics',
      { polygon: { points: polygon } },
    );
  }

  public getFullPolygonAnalytics(
    polygon: LatLng[],
  ): Observable<FullPolygonAnalytics> {
    return this.http.post<FullPolygonAnalytics>(
      '/PolygonAnalyticsDashboard',
      { polygon: { points: polygon } },
    );
  }

}
