import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SportObject } from '../models/sport-object';
import { SportObjectFilterRequest } from '../models/sport-object-filter';
import { SportObjectsService } from '../services/sport-objects.service';


@Injectable({
  providedIn: 'root',
})
export class SportObjectsApiService {

  constructor(
    private readonly http: HttpClient,
    private readonly sportObjectUtils: SportObjectsService,
  ) { }

  // #region Filters

  public getFilteredObjects(
    request: SportObjectFilterRequest,
  ): Observable<SportObject[]> {
    return this.http.post<{ sportsObjects: SportObject[] }>(
      '/ListSportsObjectsDetailed',
      request,
    ).pipe(
      map(dto => dto.sportsObjects),
    );
  }

  public getFilteredObjectsGeoJson(
    request: SportObjectFilterRequest,
  ): Observable<GeoJSON.FeatureCollection<GeoJSON.Point, SportObject>> {
    return this.getFilteredObjects(request).pipe(
      map(objects => this.sportObjectUtils.convertToGeoJson(objects)),
    );
  }


  public getDepartmentalOrganizationNames(): Observable<string[]> {
    return this.http.get<{ names: string[]; listStats: { count: number } }>(
      '/ListDepartmentalOrganizationsNames',
    ).pipe(
      map(dto => dto.names),
    );
  }

  public getObjectNames(): Observable<string[]> {
    return this.http.get<{ names: string[]; listStats: { count: number } }>(
      '/ListObjectsNames',
    ).pipe(
      map(dto => dto.names),
    );
  }

  public getSportKinds(): Observable<string[]> {
    return this.http.get<{ kinds: string[]; listStats: { count: number } }>(
      '/ListSportKinds',
    ).pipe(
      map(dto => dto.kinds),
    );
  }

  public getSportAreaNames(): Observable<string[]> {
    return this.http.get<{ names: string[]; listStats: { count: number } }>(
      '/ListSportsAreaNames',
    ).pipe(
      map(dto => dto.names),
    );
  }

  public getSportAreaTypes(): Observable<string[]> {
    return this.http.get<{ types: string[]; listStats: { count: number } }>(
      '/ListSportsAreaTypes',
    ).pipe(
      map(dto => dto.types),
    );
  }

  // #endregion

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
