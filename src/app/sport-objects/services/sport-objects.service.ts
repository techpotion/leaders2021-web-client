import { Injectable } from '@angular/core';

import {
  SportArea,
  SportAreaType,
  SportObject,
} from '../models/sport-object';


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

  public getAreaTypes(areas: SportArea[]): SportAreaType[] {
    const types: SportAreaType[] = [];
    for (const area of areas) {
      let type = types.find(type => type.type === area.sportsAreaType);
      if (!type) {
        type = { type: area.sportsAreaType, names: [] };
        types.push(type);
      }
      type.names.push(area.sportsAreaName);
    }
    return types;
  }

  public getSportKinds(areas: SportArea[]): string[] {
    const kinds: string[] = [];
    for (const area of areas) {
      if (kinds.includes(area.sportKind)) {
        continue;
      }
      kinds.push(area.sportKind);
    }
    return kinds;
  }

}
