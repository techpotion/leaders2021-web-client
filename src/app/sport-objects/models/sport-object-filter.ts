import { SportObjectAvailability } from './sport-object';
import { EnumSelectVariant } from '../../shared/models/enum-select-variant';

export interface SportObjectFilterRequest {
  objectIds?: number[];
  objectNames?: string[];
  departamentalOrganizationIds?: number[];
  departamentalOrganizationNames?: string[];
  sportAreaNames?: string[];
  sportAreaTypes?: string[];
  availabilities?: SportObjectAvailability[];
  sportKinds?: string[];
}

export type FilterApiName = keyof SportObjectFilterRequest;

export interface SportObjectFilterSource {
  name: string;
  variants: string[] | EnumSelectVariant[];
  apiName: FilterApiName;
}

