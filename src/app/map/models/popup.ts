import { LatLng } from './lat-lng';


export interface PopupSource {
  position: LatLng;
  // eslint-disable-next-line
  component: any;
  // eslint-disable-next-line
  initMethod?: (component: any) => void;
  // eslint-disable-next-line
  eventHandler?: (component: any) => void;
  anchor?: mapboxgl.Anchor;
}
