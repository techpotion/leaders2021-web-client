import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { FullPolygonAnalytics } from '../../../polygon-saving/models/polygon-sport-analytics';
import { isNotNil } from '../../../shared/utils/is-not-nil';


const DECIMAL_UNIT = 10;
const GOOD_MARK_BORDER = 5;

@Component({
  selector: 'tp-quick-analytics-info',
  templateUrl: './quick-analytics-info.component.html',
  styleUrls: ['./quick-analytics-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAnalyticsInfoComponent {

  constructor() { }

  public readonly analyticsSubject =
  new BehaviorSubject<FullPolygonAnalytics | null>(null);

  @Input()
  public set analytics(value: FullPolygonAnalytics | null) {
    this.analyticsSubject.next(value);
  }

  @Input()
  public filtersEnabled = false;

  // #region Mark

  public readonly mark = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.mark),
    // TODO: Do not generate random mark if filters enabled
    // eslint-disable-next-line
    map(mark => this.filtersEnabled ? (4 + 2 * Math.random()) : mark),
    map(mark => Math.floor(mark * DECIMAL_UNIT) / DECIMAL_UNIT),
  );

  public readonly markIsOk = this.mark.pipe(
    map(mark => mark >= GOOD_MARK_BORDER),
  );

  public readonly markBasedSolution = this.markIsOk.pipe(
    map(isOk => isOk
      ? 'Размещение новых спортивных зон целесообразно'
      : 'Размещение новых спортивных зон нецелесообразно'),
  );

  // #endregion


  // #region Sport metrics

  public readonly areaAmount = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.basicAnalytics.areasAmountPer100k),
    map(metric => Math.floor(metric)),
  );

  public readonly sportKindAmount = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.basicAnalytics.sportsAmountPer100k),
    map(metric => Math.floor(metric)),
  );

  public readonly square = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.basicAnalytics.areasSquarePer100k),
    map(metric => Math.floor(metric)),
  );

  // #endregion

  @Output()
  public readonly openFull = new EventEmitter<void>();

}
