import { PolygonSportAnalytics } from './polygon-sport-analytics';
import { SportArea } from '../../sport-objects/models/sport-object';
import { LatLng } from '../../map/models/lat-lng';


export interface SportPolygon {
  geometry: LatLng[];
  name: string;
  analytics: PolygonSportAnalytics;
  areas: SportArea[];
}
