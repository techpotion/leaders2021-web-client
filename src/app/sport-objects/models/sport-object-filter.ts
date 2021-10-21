import _ from 'lodash';

import { SportObjectAvailability } from './sport-object';
import { EnumSelectVariant } from '../../shared/models/enum-select-variant';
import { LatLng } from '../../map/models/lat-lng';

export type SportObjectFilterRequest = SimpleSportObjectFilterRequest & {
  objectIds?: number[];
  sportAreaNames?: string[];
  sportAreaTypes?: string[];
  sportKinds?: string[];
};

export interface SimpleSportObjectFilterRequest {
  objectNames?: string[];
  departamentalOrganizationIds?: number[];
  departamentalOrganizationNames?: string[];
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
    && !request.departamentalOrganizationIds?.length
    && !request.departamentalOrganizationNames?.length
    && !request.objectIds?.length
    && !request.objectNames?.length
    && !request.sportAreaNames?.length
    && !request.sportAreaTypes?.length
    && !request.sportKinds?.length;
}

export function areFilterRequestsEqual(
  request: SportObjectFilterRequest,
  other: SportObjectFilterRequest,
): boolean {
  return _.isEqual(request, other)
  && (_.isEqual(request.availabilities, other.availabilities)
    || _.isEqual(request.departamentalOrganizationIds,
                 other.departamentalOrganizationIds)
    || _.isEqual(request.departamentalOrganizationNames,
                 other.departamentalOrganizationNames)
    || _.isEqual(request.objectIds, other.objectIds)
    || _.isEqual(request.objectNames, other.objectNames)
    || _.isEqual(request.sportAreaNames, other.sportAreaNames)
    || _.isEqual(request.sportAreaTypes, other.sportAreaTypes)
    || _.isEqual(request.sportKinds, other.sportKinds));
}

export type FilterApiName = keyof SportObjectFilterRequest;

export interface SportObjectFilterSource {
  name: string;
  variants: string[] | EnumSelectVariant[];
  apiName: FilterApiName;
}

