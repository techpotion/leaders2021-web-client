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
import { createSizeIncreaseAnimation } from '../../../shared/utils/create-size-increase-animation';


@Component({
  selector: 'tp-sport-object-filter-bar',
  templateUrl: './sport-object-filter-bar.component.html',
  styleUrls: ['./sport-object-filter-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    createSizeIncreaseAnimation('height'),
  ],
})
export class SportObjectFilterBarComponent {

  constructor() { }


  // #region Appearance

  public areFiltersOpened = false;

  public toggleFilters(): void {
    this.areFiltersOpened = !this.areFiltersOpened;
  }

  // #endregion


  // #region Name filtering

  @Input()
  public nameVariants: string[] = [];

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

  // #endregion


  // #region Parameter filtering

  @Input()
  public filterSources: SportObjectFilterSource[] = [];

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

  // #endregion


  // #region Filter request

  /**
   * Request with filters to be send.
   */
  public request: SportObjectFilterRequest = {};

  /**
   * Applies existing request.
   */
  public applyFilterRequest(): void {
    this.filterRequest.emit(this.request);
  }

  /**
   * Filter request event emitter.
   */
  @Output()
  public readonly filterRequest =
  new EventEmitter<SportObjectFilterRequest>();

  /**
   * Clears selection in select component and applies empty request.
   */
  public clearFilters(): void {
    // updating variants in multiple select to clear selection
    for (const source of this.filterSources) {
      source.variants = [ ...(source.variants as string[]) ];
    }

    this.request = {};
    this.applyFilterRequest();
  }

  // #endregion

}
