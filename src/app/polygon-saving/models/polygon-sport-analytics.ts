import { LatLng } from '../../map/models/lat-lng';

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
}

export interface Park {
  commonName: string;
  admArea: string;
  district: string;
  location: string;
  hasSportground: boolean;
  objectPoint: LatLng;
}

export interface PollutionPoint {
  admArea: string;
  district: string;
  location: string;
  isPolluted: boolean;
  objectPoint: LatLng;
  results: string;
}

export interface FullPolygonAnalytics {
  basicAnalytics: PolygonSportAnalytics;
  parkAnalytics: {
    parks: Park[];
  };
  pollutionAnalytics: {
    points: PollutionPoint;
  };
}
