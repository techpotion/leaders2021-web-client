import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import {
  SportObjectFilterSource,
  SportObjectFilterRequest,
  FilterApiName,
} from '../../models/sport-object-filter';

import { EnumSelectVariant } from '../../../shared/models/enum-select-variant';


@Component({
  selector: 'tp-sport-object-filter-bar',
  templateUrl: './sport-object-filter-bar.component.html',
  styleUrls: ['./sport-object-filter-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportObjectFilterBarComponent {

  constructor() { }

  public areFiltersOpened = false;

  public toggleFilters(): void {
    this.areFiltersOpened = !this.areFiltersOpened;
  }

  @Input()
  public filterSources: SportObjectFilterSource[] = [];

  public request: SportObjectFilterRequest = {};

  public onChange(
    filters: (string | EnumSelectVariant)[],
    name: FilterApiName,
  ): void {
    const requestFilters = filters.map(filter => typeof filter === 'string' ? filter : filter.index);
    this.request[name] = requestFilters as number[] & string[];
    console.log(this.request);
  }

}
