import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as turf from '@turf/turf';

import { LatLng } from '../../map/models/lat-lng';

import { SportObjectsApiService } from './sport-objects-api.service';


const OBJECTS_RADIUS = 1;

@Injectable({
  providedIn: 'root',
})
export class PointApiService {

  constructor(
    private readonly http: HttpClient,
    private readonly objectsApi: SportObjectsApiService,
  ) { }

  public getPopulationDensity(point: LatLng): Observable<number> {
    return this.http.post<{ density: number }>(
      '/GetDensity', { point },
    ).pipe(
      map(dto => dto.density),
    );
  }

  public getObjectsDensity(point: LatLng): Observable<number> {
    const circle = turf.circle([point.lng, point.lat], OBJECTS_RADIUS);
    const polygon = circle.geometry.coordinates[0].map(coordinate => ({
      lat: coordinate[1],
      lng: coordinate[0],
    }));

    return this.objectsApi.getFilteredObjects({
      polygon: { points: polygon },
    }).pipe(
      map(objects => objects.length),
    );
  }

}
