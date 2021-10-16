import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class SportObjectsApiService {

  constructor(
    private readonly http: HttpClient,
  ) { }

  public getDensity(): Observable<GeoJSON.FeatureCollection> {
    return this.http.get<{ geoJson: string }>('/GetGeoJsonSportsObjects').pipe(
      map(dto => JSON.parse(dto.geoJson) as GeoJSON.FeatureCollection),
    );
  }

}
