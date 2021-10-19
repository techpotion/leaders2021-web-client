import { Injectable } from '@angular/core';

import { SportObject } from '../models/sport-object';


@Injectable({
  providedIn: 'root',
})
export class SportObjectsService {

  constructor() { }

  public convertToGeoJson(
    objects: SportObject[],
  ): GeoJSON.FeatureCollection<GeoJSON.Point, SportObject> {
    const features: GeoJSON.Feature<GeoJSON.Point, SportObject>[] = [];
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
        properties: obj,
      });
    }

    const featureCollection:
    GeoJSON.FeatureCollection<GeoJSON.Point, SportObject> = {
      type: 'FeatureCollection' as const,
      features,
    };

    return featureCollection;
  }

}
