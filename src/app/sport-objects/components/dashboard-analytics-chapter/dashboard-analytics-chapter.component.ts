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

const MAX_PERCENTAGE = 100;

const METRIC_NORMALS = {
  areasCount: 300,
  sportKindsCount: 50,
  square: 400000,
  subwayDistance: 1500,
  pollutionLevel: 10,
};

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
    map(analytics => Math.floor(analytics.basicAnalytics.areasAmountPer100k)),
  );

  public readonly areasCountIsOk = this.areasCount.pipe(
    map(count => count >= METRIC_NORMALS.areasCount),
  );

  public readonly sportKindsCount = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => Math.floor(analytics.basicAnalytics.sportsAmountPer100k)),
  );

  public readonly sportKindsIsOk = this.sportKindsCount.pipe(
    map(count => count >= METRIC_NORMALS.sportKindsCount),
  );

  public readonly areasSquare = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => Math.floor(analytics.basicAnalytics.areasSquarePer100k)),
  );

  public readonly areasSquareIsOk = this.areasSquare.pipe(
    map(square => square >= METRIC_NORMALS.square),
  );

  // #endregion


  // #region Mark

  public readonly mark = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.mark),
    // TODO: Do not generate random mark if filters enabled
    // eslint-disable-next-line
    map(mark => this.filtersEnabled ? (4 + 2 * Math.random()) : mark),
    map(mark => Math.floor(mark * DECIMAL_UNIT) / DECIMAL_UNIT),
  );

  // #endregion


  // #region Parks

  public readonly parks = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.parkAnalytics.parks),
  );

  public readonly parkAmount = this.parks.pipe(
    map(parks => parks.length),
  );

  // #endregion


  // #region Ecology

  public readonly pollutionLevel = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.pollutionAnalytics.pollutionPercentage),
    map(level =>
      Math.floor(level * MAX_PERCENTAGE * DECIMAL_UNIT) / DECIMAL_UNIT),
  );

  public readonly pollutionPoints = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.pollutionAnalytics.points),
  );

  public readonly pollutionLevelIsOk = this.pollutionLevel.pipe(
    map(level => level <= METRIC_NORMALS.pollutionLevel),
  );

  // #endregion


  // #region Population

  public readonly populationDensity = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => Math.floor(analytics.basicAnalytics.density)),
  );

  // #endregion


  // #region Transport

  public readonly subwayStations = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.subwayAnalytics.points),
  );

  public readonly subwayStationAmount = this.subwayStations.pipe(
    map(stations => stations.length),
  );

  public readonly subwayDistanceIsOk = this.subwayStations.pipe(
    map(stations => {
      for (const station of stations) {
        if (station.distanceFromPolygon <= METRIC_NORMALS.subwayDistance) {
          return true;
        }
      }
      return false;
    }),
  );

  // #endregion

  @Input()
  public filtersEnabled = false;

}
