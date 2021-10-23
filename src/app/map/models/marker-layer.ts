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
  popup?: {
    // eslint-disable-next-line
    component: any;
    // eslint-disable-next-line
    initMethod?: (component: any, obj: any) => void;
    // eslint-disable-next-line
    eventHandler?: (component: any, obj: any) => void;
  };
}

export interface MarkerLayer {
  id: string;
  markers: Map<string, mapboxgl.Marker>;
  popups?: Map<string, mapboxgl.Popup>;
  renderSubscription?: Subscription;
}
