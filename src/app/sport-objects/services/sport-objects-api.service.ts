import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SportObject } from '../models/sport-object';
import { SportObjectsService } from '../services/sport-objects.service';


@Injectable({
  providedIn: 'root',
})
export class SportObjectsApiService {

  constructor(
    private readonly http: HttpClient,
    private readonly sportObjectUtils: SportObjectsService,
  ) { }

  public getObjectsGeoJson(
  ): Observable<GeoJSON.FeatureCollection<GeoJSON.Point, SportObject>> {
    return this.getObjects().pipe(
      map(objects => this.sportObjectUtils.convertToGeoJson(objects)),
    );
  }

  public getObjects(): Observable<SportObject[]> {
    return this.http.post<{ sportsObjects: SportObject[] }>('/ListSportsObjects', {}).pipe(
      map(dto => dto.sportsObjects),
    );
  }

}
