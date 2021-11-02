import _ from 'lodash';

import { SportObjectAvailability } from './sport-object';
import { EnumSelectVariant } from '../../shared/models/enum-select-variant';
import { LatLng } from '../../map/models/lat-lng';


export interface SportObjectFilterRequest
  extends SimpleSportObjectFilterRequest {
  objectIds?: number[];
  sportsAreaNames?: string[];
  sportsAreaTypes?: string[];
  sportKinds?: string[];
}

export interface SimpleSportObjectFilterRequest {
  objectNames?: string[];
  departmentalOrganizationIds?: number[];
  departmentalOrganizationNames?: string[];
  availabilities?: SportObjectAvailability[];
  polygon?: {
    points: LatLng[];
  };
}

export type SportObjectFilterType = number[]
& string[]
& SportObjectAvailability[]
& { points: LatLng[] };

export function isFilterRequestEmpty(
  request: SportObjectFilterRequest,
): boolean {
  return !request.availabilities?.length
    && !request.departmentalOrganizationIds?.length
    && !request.departmentalOrganizationNames?.length
    && !request.objectIds?.length
    && !request.objectNames?.length
    && !request.sportsAreaNames?.length
    && !request.sportsAreaTypes?.length
    && !request.sportKinds?.length;
}

export function areFilterRequestsEqual(
  request: SportObjectFilterRequest,
  other: SportObjectFilterRequest,
): boolean {
  return _.isEqual(request, other)
  && (_.isEqual(request.availabilities, other.availabilities)
    || _.isEqual(request.departmentalOrganizationIds,
                 other.departmentalOrganizationIds)
    || _.isEqual(request.departmentalOrganizationNames,
                 other.departmentalOrganizationNames)
    || _.isEqual(request.objectIds, other.objectIds)
    || _.isEqual(request.objectNames, other.objectNames)
    || _.isEqual(request.sportsAreaNames, other.sportsAreaNames)
    || _.isEqual(request.sportsAreaTypes, other.sportsAreaTypes)
    || _.isEqual(request.sportKinds, other.sportKinds));
}

export type FilterApiName = keyof SportObjectFilterRequest;

export interface SportObjectFilterSource {
  name: string;
  variants: string[] | EnumSelectVariant[];
  apiName: FilterApiName;
}

