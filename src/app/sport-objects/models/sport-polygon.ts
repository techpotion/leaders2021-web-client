import { LatLng } from '../../map/models/lat-lng';
import { PolygonSportAnalytics } from './polygon-sport-analytics';
import { SportArea } from './sport-object';


export interface SportPolygon {
  geometry: LatLng[];
  name: string;
  analytics: PolygonSportAnalytics;
  areas: SportArea[];
}
