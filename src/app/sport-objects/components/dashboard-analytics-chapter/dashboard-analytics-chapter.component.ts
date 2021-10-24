import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { isNotNil } from '../../../shared/utils/is-not-nil';

import { FullPolygonAnalytics } from '../../models/polygon-sport-analytics';


@Component({
  selector: 'tp-dashboard-analytics-chapter',
  templateUrl: './dashboard-analytics-chapter.component.html',
  styleUrls: ['./dashboard-analytics-chapter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAnalyticsChapterComponent {

  constructor() { }

  public readonly analyticsSubject =
  new BehaviorSubject<FullPolygonAnalytics | null>(null);

  @Input()
  public set analytics(value: FullPolygonAnalytics | null) {
    this.analyticsSubject.next(value);
  }

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

}
