import { LatLng } from './lat-lng';
import { PolygonSportAnalytics } from '../../sport-objects/models/polygon-sport-analytics';
import { SportArea } from '../../sport-objects/models/sport-object';


export interface Polygon {
  geometry: LatLng[];
  name: string;
  analytics: PolygonSportAnalytics;
  areas: SportArea[];
}
