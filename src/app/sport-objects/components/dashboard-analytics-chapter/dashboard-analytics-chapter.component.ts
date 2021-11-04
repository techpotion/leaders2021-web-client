import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { isNotNil } from '../../../shared/utils/is-not-nil';

import { FullPolygonAnalytics } from '../../../polygon-saving/models/polygon-sport-analytics';


const DECIMAL_UNIT = 10;

@Component({
  selector: 'tp-dashboard-analytics-chapter',
  templateUrl: './dashboard-analytics-chapter.component.html',
  styleUrls: ['./dashboard-analytics-chapter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAnalyticsChapterComponent {

  constructor() { }

  // #region Analytics source

  public readonly analyticsSubject =
  new BehaviorSubject<FullPolygonAnalytics | null>(null);

  @Input()
  public set analytics(value: FullPolygonAnalytics | null) {
    this.analyticsSubject.next(value);
  }

  // #endregion


  // #region Metrics

  public readonly areasCount = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.basicAnalytics.areasAmount),
  );

  public readonly sportKindsCount = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.basicAnalytics.sportsAmount),
  );

  public readonly areasSquare = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => Math.floor(analytics.basicAnalytics.areasSquare)),
  );

  // #endregion


  // #region Mark

  public readonly mark = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.mark),
    map(mark => Math.floor(mark * DECIMAL_UNIT) / DECIMAL_UNIT),
  );

  // #endregion

}
