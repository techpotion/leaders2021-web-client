import { LatLng } from '../../map/models/lat-lng';


export enum SportObjectAvailability {
  City = 1,
  Region = 2,
  District = 3,
  WalkingDistance = 4,
}

export interface SportObject {
  objectId: number;
  objectName: string;
  objectAddress: string;
  objectPoint: LatLng;
  departmentalOrganizationId: number;
  departmentalOrganizationName: string;
  availability: SportObjectAvailability;
  objectSumSquare: number;
}

export interface SportArea {
  objectId: number;
  objectName: string;
  sportAreaAddress: string;
  objectPoint: LatLng;
  departmentalOrganizationId: number;
  departmentalOrganizationName: string;
  sportsAreaId: number;
  sportsAreaName: string;
  sportsAreaType: string;
  sportsAreaSquare: number;
  availability: SportObjectAvailability;
  sportKind: string;
}

export interface SportAreaType {
  type: string;
  names: string[];
}
