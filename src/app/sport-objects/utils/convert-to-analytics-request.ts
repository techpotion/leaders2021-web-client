import { AnalyticsFilterRequest } from '../../polygon-saving/models/polygon-sport-analytics';
import { SportObjectFilterRequest } from '../models/sport-object-filter';
import { LatLng } from '../../map/models/lat-lng';


export function convertToAnalyticsRequest(
  request: SportObjectFilterRequest,
  polygon: LatLng[],
): AnalyticsFilterRequest {
  return {
    polygon: { points: polygon },
    sportKinds: request.sportKinds,
    sportsAreaTypes: request.sportsAreaTypes,
    sportsAreaNames: request.sportsAreaNames,
    departmentalOrganizationNames: request.departmentalOrganizationNames,
    availabilities: request.availabilities,
  };
}
