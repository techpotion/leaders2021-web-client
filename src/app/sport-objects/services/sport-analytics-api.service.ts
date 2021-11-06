import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { LatLng } from '../../map/models/lat-lng';
import {
  FullPolygonAnalytics,
  PolygonSportAnalytics,
} from '../../polygon-saving/models/polygon-sport-analytics';


const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

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

  public getPolygonAnalyticsBlob(
    polygon: LatLng[],
  ): Observable<Blob> {
    return this.getFullPolygonAnalytics(polygon).pipe(
      switchMap(analytics =>
        this.http.post<{ data: string }>('/GetExport', analytics)),
      map(({ data }) => {
        const binaryString = window.atob(data);
        const bytes = new Uint8Array(
          binaryString.split('').map(character => character.charCodeAt(0)),
        );
        return new Blob([bytes], { type: XLSX_MIME_TYPE });
      }),
    );
  }

}
