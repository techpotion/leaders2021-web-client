import { Injectable } from '@angular/core';

import { SportObject } from '../models/sport-object';


@Injectable({
  providedIn: 'root',
})
export class SportObjectsService {

  constructor() { }

  public convertToGeoJson(
    objects: SportObject[],
  ): GeoJSON.FeatureCollection<GeoJSON.Point, { id: number }> {
    const features: GeoJSON.Feature<GeoJSON.Point, { id: number }>[] = [];
    for (const obj of objects) {
      features.push({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            obj.objectPoint.lng,
            obj.objectPoint.lat,
          ],
        },
        properties: {
          id: obj.objectId,
        },
      });
    }

    const featureCollection:
    GeoJSON.FeatureCollection<GeoJSON.Point, { id: number }> = {
      type: 'FeatureCollection' as const,
      features,
    };

    return featureCollection;
  }

}
