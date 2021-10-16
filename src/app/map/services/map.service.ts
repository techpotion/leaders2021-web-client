import { Injectable } from '@angular/core';

import mapboxgl from 'mapbox-gl';
import _ from 'lodash';

import { Heatmap } from '../models/heatmap';
import { isNotNil } from '../../shared/utils/is-not-nil';


@Injectable({
  providedIn: 'root',
})
export class MapService {

  constructor() { }

  public addHeatmap(map: mapboxgl.Map, heatmap: Heatmap, id: string): void {
    this.removeHeatmap(map, id);

    map.addSource(id, {
      type: 'geojson',
      data: heatmap.data,
    });

    const propertyValues = heatmap.data.features
      .map(feature => feature.properties)
      .filter(isNotNil)
      .map(properties => properties[heatmap.property] as number);

    const radiusStops = heatmap.radiusStops.map(
      ({ zoom, radius }) => [ zoom, radius ],
    );

    map.addLayer({
      id,
      type: 'heatmap',
      source: id,
      maxzoom: heatmap.maxzoom,
      paint: {
        'heatmap-weight': {
          property: 'heatness',
          stops: [
            [_.min(propertyValues), 0],
            [_.max(propertyValues), 1],
          ],
        },
        'heatmap-radius': {
          stops: radiusStops,
        },
        'heatmap-opacity': 0.3,
      },
    });
  }

  public removeHeatmap(map: mapboxgl.Map, id: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (map.getSource(id)) {
      map.removeSource(id);
    }
  }

  public removeHeatmaps(map: mapboxgl.Map, ids: string[]): void {
    for (const id of ids) {
      this.removeHeatmap(map, id);
    }
  }

}
