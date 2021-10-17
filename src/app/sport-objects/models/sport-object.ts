import { LatLng } from '../../map/models/lat-lng';


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

export enum SportObjectAvailability {
  City = 1,
  Region = 2,
  District = 3,
  WalkingDistance = 4,
}
