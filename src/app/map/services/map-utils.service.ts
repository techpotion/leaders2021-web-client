import { Injectable } from '@angular/core';

import { LatLng } from '../models/lat-lng';


@Injectable({
  providedIn: 'root',
})
export class MapUtilsService {

  constructor() { }

  public getMostLeftPoint(points: LatLng[]): LatLng {
    let leftPoint = points[0];
    for (const point of points) {
      if (point.lng < leftPoint.lng) {
        leftPoint = point;
      }
    }
    return leftPoint;
  }

}
