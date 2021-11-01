import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { SportObjectsService } from '../../services/sport-objects.service';
import { isNotNil } from '../../../shared/utils/is-not-nil';

import { SportArea } from '../../models/sport-object';
import { FullPolygonAnalytics } from '../../../polygon-saving/models/polygon-sport-analytics';


type SortOrder = 'ascending' | 'descending';
const DEFAULT_SORT_ORDER: SortOrder = 'ascending';

@Component({
  selector: 'tp-dashboard-area-types-chapter',
  templateUrl: './dashboard-area-types-chapter.component.html',
  styleUrls: ['./dashboard-area-types-chapter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAreaTypesChapterComponent {

  constructor(
    public readonly sportObjectUtils: SportObjectsService,
  ) { }

  public readonly areasSubject = new BehaviorSubject<SportArea[]>([]);

  @Input()
  public set areas(value: SportArea[] | null) {
    const updateValue = value ?? [];
    this.areasSubject.next(updateValue);
  }

  public readonly analyticsSubject =
  new BehaviorSubject<FullPolygonAnalytics | null>(null);

  @Input()
  public set analytics(value: FullPolygonAnalytics | null) {
    this.analyticsSubject.next(value);
  }

  public readonly sportKindsCount = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.basicAnalytics.sportsAmount),
  );

  public readonly sportKindsCountPer100k = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => Math.floor(analytics.basicAnalytics.sportsAmountPer100k)),
  );

  public readonly sportKinds = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.basicAnalytics.sportsKinds),
  );

  public readonly sportKindsChartData = combineLatest([
    this.sportKinds,
    this.areasSubject,
  ]).pipe(
    map(([sportKinds, areas]) => sportKinds.map(kind => ({
      label: kind,
      value: areas.filter(area => area.sportKind === kind).length,
    }))),
  );

  public readonly areasSquare = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => Math.floor(analytics.basicAnalytics.areasSquare)),
  );

  public readonly sortOrder =
  new BehaviorSubject<SortOrder>(DEFAULT_SORT_ORDER);

  public toggleSortOrder(): void {
    if (this.sortOrder.value === 'ascending') {
      this.sortOrder.next('descending');
    } else {
      this.sortOrder.next('ascending');
    }
  }

  public readonly sortedAreas = combineLatest([
    this.areasSubject,
    this.sortOrder,
  ]).pipe(
    map(([areas, order]) => [...areas].sort((a, b) => {
      const aValue = a.sportsAreaSquare;
      const bValue = b.sportsAreaSquare;
      if (aValue > bValue) {
        return order === 'ascending' ? 1 : -1;
      }
      return order === 'ascending' ? -1 : 1;
    })),
  );

  public readonly sportKindSquares = combineLatest([
    this.sportKinds,
    this.areasSubject,
  ]).pipe(
    map(([sportKinds, areas]) => sportKinds.map(kind => ({
      label: kind,
      value: Math.floor(areas.filter(
        area => area.sportKind === kind,
      ).map(
        area => area.sportsAreaSquare,
      ).reduce(
        (prev, curr) => prev + curr,
      )),
    }))),
  );

}
