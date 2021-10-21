import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  SportObjectFilterSource,
  SportObjectFilterRequest,
  SportObjectFilterType,
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
  public nameVariants: string[] = [];

  @Input()
  public filterSources: SportObjectFilterSource[] = [];

  public request: SportObjectFilterRequest = {};

  public onChange(
    filters: (string | EnumSelectVariant)[],
    name: FilterApiName,
  ): void {
    const filterSource = this.filterSources.find(source =>
      source.apiName === name);
    if (!filterSource) {
      throw new Error('Wrong API filter name.');
    }

    const formattedFilters = filters.map(
      filter => typeof filter === 'string' ? filter : filter.index,
    );
    const purifiedFilters = filters.length === filterSource.variants.length
      ? []
      : formattedFilters;

    this.request[name] = purifiedFilters as SportObjectFilterType;
  }

  public onNameSearch(name: string): void {
    if (!name.length) {
      this.applyFilterRequest();
      return;
    }

    const request: SportObjectFilterRequest = {
      objectNames: [name],
    };
    this.filterRequest.emit(request);
  }

  public applyFilterRequest(): void {
    this.filterRequest.emit(this.request);
  }

  @Output()
  public readonly filterRequest =
  new EventEmitter<SportObjectFilterRequest>();

  public clearFilters(): void {
    for (const source of this.filterSources) {
      source.variants = [ ...(source.variants as string[]) ];
    }
    this.applyFilterRequest();
  }

}
