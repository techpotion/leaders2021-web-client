import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LatLng } from '../../map/models/lat-lng';
import { SportObjectAvailability } from '../../sport-objects/models/sport-object';


@Injectable({
  providedIn: 'root',
})
export class SportPolygonApiService {

  constructor(
    private readonly http: HttpClient,
  ) { }

  /* eslint-disable */
  public getIntersections(
    polygon: LatLng[],
    availability: SportObjectAvailability,
  ): Observable<GeoJSON.FeatureCollection<GeoJSON.Polygon>[]> {
    return this.http.post<{ intersections: { geojson: string }[] }>(
      '/ListIntersections',
      {
        polygon: { points: polygon },
        availability,
      },
    ).pipe(
      map((dto) => {
        const result: GeoJSON.FeatureCollection<GeoJSON.Polygon>[] = []
        for (const intersection of dto.intersections)
          result.push(JSON.parse(intersection.geojson))
        return result
      }),
    );
  }
  /* eslint-enable */
}
