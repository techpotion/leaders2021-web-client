import { LatLng } from '../../map/models/lat-lng';
import { SportObjectAvailability } from '../../sport-objects/models/sport-object';

export interface PolygonSportAnalytics {
  areasSquare: number;
  areasSquarePer100k: number;
  areasAmount: number;
  areasAmountPer100k: number;
  sportsAmount: number;
  sportsAmountPer100k: number;
  sportsKinds: string[];
  areaTypes: string[];
  areaTypesAmount: number;
  sportsObjectsAmount: number;
  sportsObjectsAmountPer100k: number;
  density: number;
}

export interface Park {
  commonName: string;
  admArea: string;
  district: string;
  location: string;
  hasSportground: boolean;
  objectPoint: LatLng;
  square: number;
}

export interface PollutionPoint {
  admArea: string;
  district: string;
  location: string;
  isPolluted: boolean;
  objectPoint: LatLng;
  results: string;
}

export interface SubwayPoint {
  name: string;
  lineColor: string;
  point: LatLng;
  distanceFromPolygon: number;
}

export interface FullPolygonAnalytics {
  basicAnalytics: PolygonSportAnalytics;
  parkAnalytics: {
    parks: Park[];
  };
  pollutionAnalytics: {
    points: PollutionPoint[];
    pollutionPercentage: number;
  };
  subwayAnalytics: {
    points: SubwayPoint[];
  };
  mark: number;
}

export interface AnalyticsFilterRequest {
  availabilities?: SportObjectAvailability[];
  sportsAreaNames?: string[];
  sportsAreaTypes?: string[];
  sportKinds?: string[];
  departmentalOrganizationNames?: string[];
  polygon?: {
    points: LatLng[];
  };
}
