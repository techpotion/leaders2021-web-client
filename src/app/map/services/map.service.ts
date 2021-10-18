import { Injectable } from '@angular/core';

import mapboxgl from 'mapbox-gl';
import _ from 'lodash';

import { Heatmap } from '../models/heatmap';
import { MarkerLayer } from '../models/marker-layer';
import { isNotNil } from '../../shared/utils/is-not-nil';


@Injectable({
  providedIn: 'root',
})
export class MapService {

  constructor() { }

  // #region Marker layer

  public addMarkerLayer(
    map: mapboxgl.Map,
    layer: MarkerLayer,
    id: string,
  ): Map<string, mapboxgl.Marker> {
    map.addSource(id, {
      type: 'geojson',
      data: layer.data,
      cluster: true,
      clusterRadius: 100,
    });

    map.addLayer({
      id: `${id}-cluster-background`,
      type: 'circle',
      source: id,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': layer.cluster.background,
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, 100,
          30, 750,
          50,
        ],
      },
    });

    map.addLayer({
      id: `${id}-cluster-count`,
      type: 'symbol',
      source: id,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans SemiBold', 'Arial Unicode MS Bold'],
        'text-size': 22,
      },
      paint: {
        'text-color': layer.cluster.color,
      },
    });

    return this.createMarkersMap(layer);
  }

  private createMarkersMap(layer: MarkerLayer): Map<string, mapboxgl.Marker> {
    const markers = new Map<string, mapboxgl.Marker>();

    for (const feature of layer.data.features) {
      const element = document.createElement('img');
      element.setAttribute('src', layer.image.source);
      element.className = layer.className;

      const marker = new mapboxgl.Marker({
        element,
        anchor: layer.image.anchor,
      });
      marker.setLngLat(feature.geometry.coordinates as [number, number]);
      markers.set(feature.properties.id.toString(), marker);
    }

    return markers;
  }

  public getShownMarkerIds(map: mapboxgl.Map, id: string): string[] {
    return map.querySourceFeatures(id)
      .filter(feature => !feature.properties?.cluster)
      .map(feature => feature.properties?.id.toString());
  }

  public removeMarkerLayer(map: mapboxgl.Map, id: string): void {
    this.removeLayer(map, `${id}-cluster-background`);
    this.removeLayer(map, `${id}-cluster-count`);
    this.removeSource(map, id);
  }

  // #endregion


  // #region Heatmap

  public addHeatmap(map: mapboxgl.Map, heatmap: Heatmap, id: string): void {
    this.removeHeatmap(map, id);

    map.addSource(id, {
      type: 'geojson',
      data: heatmap.data,
    });

    const radiusStops = heatmap.radiusStops.map(
      ({ zoom, radius }) => [ zoom, radius ],
    );

    const layer: mapboxgl.HeatmapLayer = {
      id,
      type: 'heatmap',
      source: id,
      maxzoom: heatmap.maxzoom,
      paint: {
        'heatmap-radius': {
          stops: radiusStops,
        },
        'heatmap-opacity': 0.3,
      },
    };

    if (heatmap.property) {
      const heatProperty = heatmap.property;
      const propertyValues = heatmap.data.features
        .map(feature => feature.properties)
        .filter(isNotNil)
        .map(properties => properties[heatProperty] as number);

      if (!layer.paint) {
        layer.paint = {};
      }
      layer.paint['heatmap-weight'] = {
        property: 'heatness',
        stops: [
          [_.min(propertyValues), 0],
          [_.max(propertyValues), 1],
        ],
      };
    }

    map.addLayer(layer);
  }

  public removeHeatmap(map: mapboxgl.Map, id: string): void {
    this.removeLayer(map, id);
    this.removeSource(map, id);
  }

  public removeHeatmaps(map: mapboxgl.Map, ids: string[]): void {
    for (const id of ids) {
      this.removeHeatmap(map, id);
    }
  }

  // #endregion

  public removeLayer(map: mapboxgl.Map, id: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  }

  public removeSource(map: mapboxgl.Map, id: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (map.getSource(id)) {
      map.removeSource(id);
    }
  }

}
