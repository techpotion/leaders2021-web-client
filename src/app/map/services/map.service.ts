import { Injectable } from '@angular/core';

import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import StaticMode from '@mapbox/mapbox-gl-draw-static-mode';
import _ from 'lodash';
// import { circle } from '@turf/turf';

import { Heatmap } from '../models/heatmap';
import { MarkerLayer, MarkerLayerSource } from '../models/marker-layer';
import { PolygonLayerSource } from '../models/polygon-layer';
import { PopupSource } from '../models/popup';
import * as drawStyles from '../models/polygon-styles';
import { LatLng } from '../models/lat-lng';

import { ComponentRenderService } from '../../shared/services/component-render.service';
import { isNotNil } from '../../shared/utils/is-not-nil';


// This is constant
// eslint-disable-next-line
const CLUSTER_RADIUSES = [ 20, 100, 30, 750, 40 ];

export type PolygonDrawMode = 'draw' | 'read';

interface MapboxDrawModes {
  [modeKey: string]: MapboxDraw.DrawCustomMode | MapboxDraw.DrawMode;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {

  constructor(
    // eslint-disable-next-line
    private readonly renderer: ComponentRenderService<any>,
  ) { }


  // #region Polygon draw

  public addPolygonDraw(
    map: mapboxgl.Map,
  ): MapboxDraw {
    const draw = new MapboxDraw({
      modes: Object.assign({
        static: StaticMode as MapboxDraw.DrawCustomMode,
      }, MapboxDraw.modes) as unknown as MapboxDrawModes,
      styles: [
        drawStyles.polygonFill,
        drawStyles.polygonStroke,
        drawStyles.drawLine,
        drawStyles.midPoint,
        drawStyles.vertexPointStroke,
        drawStyles.vertexPoint,
        drawStyles.drawVertexPointStroke,
        drawStyles.drawVertexPoint,
      ],
    });
    map.addControl(draw);

    return draw;
  }

  private toDrawMode(
    mode: PolygonDrawMode,
  ): MapboxDraw.DrawModes[keyof MapboxDraw.DrawModes] {
    if (mode === 'draw') {
      return 'draw_polygon';
    }
    return 'static';
  }

  public changeDrawMode(draw: MapboxDraw, mode: PolygonDrawMode): void {
    const drawMode = this.toDrawMode(mode);
    if (draw.getMode() === drawMode) { return; }

    // Strange if-construction because of strange typing in mapbox-gl-draw
    if (drawMode === 'simple_select') {
      draw.changeMode(drawMode);
    } else if (drawMode === 'draw_line_string') {
      draw.changeMode(drawMode);
    } else if (drawMode === 'draw_polygon'
      || drawMode === 'draw_point'
      || drawMode === 'static') {
      draw.changeMode(drawMode);
    }
  }

  public addPolygonLayer(
    map: mapboxgl.Map,
    layer: PolygonLayerSource,
    id: string,
  ): void {
    map.addSource(id, {
      type: 'geojson',
      data: layer.polygon,
    });

    map.addLayer({
      id,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': layer.color,
        'fill-opacity': layer.opacity,
      },
    });
  }

  public removePolygonLayer(map: mapboxgl.Map, id: string): void {
    this.removeLayer(map, id);
    this.removeSource(map, id);
  }

  public removePolygonLayers(map: mapboxgl.Map, ids: string[]): void {
    for (const id of ids) {
      this.removePolygonLayer(map, id);
    }
  }

  public getPolygonCenter(polygon: LatLng[]): LatLng {
    return {
      lat: _.mean(polygon.map(vertex => vertex.lat)),
      lng: _.mean(polygon.map(vertex => vertex.lng)),
    };
  }

  public getPolygonBounds(polygon: LatLng[]): [LatLng, LatLng] {
    const minLat = _.min(polygon.map(vertex => vertex.lat));
    const minLng = _.min(polygon.map(vertex => vertex.lng));
    const maxLat = _.max(polygon.map(vertex => vertex.lat));
    const maxLng = _.max(polygon.map(vertex => vertex.lng));
    if (!minLat || !minLng || !maxLat || !maxLng) {
      throw new Error('Cannot create bounds: not enought vertices.');
    }

    return [
      {
        lat: minLat,
        lng: minLng,
      },
      {
        lat: maxLat,
        lng: maxLng,
      },
    ];
  }

  // #endregion


  // #region Marker layer

  public addMarkerLayer(
    map: mapboxgl.Map,
    layer: MarkerLayerSource,
    id: string,
  ): MarkerLayer {
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
          ...CLUSTER_RADIUSES,
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

    const markers = this.createMarkersMap(layer, map);

    return { id, markers };
  }

  private createMarkersMap(
    layer: MarkerLayerSource,
    map: mapboxgl.Map,
  ): Map<string, mapboxgl.Marker> {
    const markers = new Map<string, mapboxgl.Marker>();

    for (const feature of layer.data.features) {
      const element = document.createElement('img');
      element.setAttribute('src', layer.image.source);
      element.className = layer.className;

      const marker = new mapboxgl.Marker({
        element,
        anchor: layer.image.anchor,
      });

      const position =
        (feature.geometry as GeoJSON.Point).coordinates as [number, number];
      marker.setLngLat(position);

      const popup = layer.popup;
      if (popup) {
        marker.getElement().addEventListener('click', (event: Event) => {
          event.stopPropagation();

          const popupContent = this.renderer.injectComponent(
            popup.component,
            component => {
              const initMethod = popup.initMethod;
              if (initMethod) {
                initMethod(component, feature.properties);
              }

              const eventHandler = popup.eventHandler;
              if (eventHandler) {
                eventHandler(component, feature.properties);
              }
            },
          );

          new mapboxgl.Popup({ closeButton: false, offset: 42 })
            .setDOMContent(popupContent).setLngLat(position).addTo(map);
        });
      }

      markers.set(layer.idMethod(feature.properties).toString(), marker);
    }

    return markers;
  }

  private getShownMarkerIds(
    map: mapboxgl.Map,
    id: string,
    // eslint-disable-next-line
    idMethod: (obj: any) => string | number,
  ): string[] {
    return map.querySourceFeatures(id)
      .filter(feature => !feature.properties?.cluster)
      .map(feature => idMethod(feature.properties).toString());
  }

  public renderLayer(
    map: mapboxgl.Map,
    id: string,
    // eslint-disable-next-line
    idMethod: (obj: any) => string | number,
    markers: Map<string, mapboxgl.Marker>,
  ): void {
    const shownMarkerIds = this.getShownMarkerIds(map, id, idMethod);

    for (const marker of markers.values()) {
      marker.remove();
    }

    // const polygons: GeoJSON.Feature[] = [];
    for (const id of shownMarkerIds) {
      const marker = markers.get(id);
      if (!marker) { continue; }

      marker.addTo(map);
    }

    // TODO: marker radius
    // polygons.push(circle([marker.getLngLat().lat, marker.getLngLat().lng],
    // 500, { units: 'meters' })); const featureCollection = { type:
    // 'FeatureCollection', features: polygons, } as GeoJSON.FeatureCollection;
    // if (!map.getSource('abc')) { map.addSource('abc', { type: 'geojson',
    // data: featureCollection, }); map.addLayer({ id:
    // `${id}-marker-availability`, type: 'fill', source: 'abc', layout: {},
    // paint: { 'fill-color': 'blue', 'fill-opacity': 0.6, }, }); } else {
    // (map.getSource('abc') as
    // mapboxgl.GeoJSONSource).setData(featureCollection); }

  }

  public removeMarkerLayer(map: mapboxgl.Map, layer: MarkerLayer): void {
    this.removeLayer(map, `${layer.id}-cluster-background`);
    this.removeLayer(map, `${layer.id}-cluster-count`);
    this.removeSource(map, layer.id);

    for (const marker of layer.markers.values()) {
      marker.remove();
    }
    if (layer.renderSubscription) {
      layer.renderSubscription.unsubscribe();
    }
  }

  public removeMarkerLayers(map: mapboxgl.Map, layers: MarkerLayer[]): void {
    for (const layer of layers) {
      this.removeMarkerLayer(map, layer);
    }
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


  // #region Popups

  public addPopup(map: mapboxgl.Map, source: PopupSource): mapboxgl.Popup {
    const popupContent = this.renderer.injectComponent(
      source.component,
      component => {
        const initMethod = source.initMethod;
        if (initMethod) {
          initMethod(component);
        }

        const eventHandler = source.eventHandler;
        if (eventHandler) {
          eventHandler(component);
        }
      },
    );

    const popupOptions: mapboxgl.PopupOptions = {
      closeButton: false,
      offset: 10,
    };
    if (source.anchor) {
      popupOptions.anchor = source.anchor;
    }
    if (source.closeOnClick !== undefined) {
      popupOptions.closeOnClick = source.closeOnClick;
    }
    return new mapboxgl.Popup(popupOptions)
      .setDOMContent(popupContent).setLngLat(source.position).addTo(map);
  }

  public addPopups(
    map: mapboxgl.Map,
    sources: PopupSource[],
  ): mapboxgl.Popup[] {
    return sources.map(source => this.addPopup(map, source));
  }

  public removePopup(popup: mapboxgl.Popup): void {
    popup.remove();
  }

  public removePopups(popups: mapboxgl.Popup[]): void {
    for (const popup of popups) {
      this.removePopup(popup);
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

  public convertToGeoJsonPolygon(polygon: LatLng[]): GeoJSON.Feature {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          polygon.map(({ lat, lng }) => [lng, lat]),
        ],
      },
    };
  }

}
