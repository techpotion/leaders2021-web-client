import { Subscription } from 'rxjs';
import mapboxgl from 'mapbox-gl';


export interface MarkerLayerSource {
  data: GeoJSON.FeatureCollection;
  // eslint-disable-next-line
  idMethod: (obj: any) => number | string;
  image: {
    source: string;
    anchor: mapboxgl.Anchor;
  };
  className: string;
  cluster: {
    background: string;
    color: string;
  };
}

export interface MarkerLayer {
  id: string;
  markers: Map<string, mapboxgl.Marker>;
  renderSubscription?: Subscription;
}
