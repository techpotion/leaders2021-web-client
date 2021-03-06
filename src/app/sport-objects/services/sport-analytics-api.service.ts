import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  AnalyticsFilterRequest,
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
    request: AnalyticsFilterRequest,
  ): Observable<PolygonSportAnalytics> {
    return this.http.post<PolygonSportAnalytics>(
      '/PolygonAnalytics',
      request,
    );
  }

  public getFullPolygonAnalytics(
    request: AnalyticsFilterRequest,
  ): Observable<FullPolygonAnalytics> {
    return this.http.post<FullPolygonAnalytics>(
      '/PolygonAnalyticsDashboard',
      request,
    );
  }

  public getPolygonAnalyticsBlob(
    request: AnalyticsFilterRequest,
  ): Observable<Blob> {
    return this.getFullPolygonAnalytics(request).pipe(
      switchMap(analytics => this.getAnalyticsBlob(analytics)),
    );
  }

  public getAnalyticsBlob(
    analytics: FullPolygonAnalytics,
  ): Observable<Blob> {
    return this.http.post<{ data: string }>('/GetExport', analytics).pipe(
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
