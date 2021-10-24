import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { SportObjectsService } from '../../services/sport-objects.service';
import { isNotNil } from '../../../shared/utils/is-not-nil';

import { SportObject, SportArea } from '../../models/sport-object';
import { FullPolygonAnalytics } from '../../models/polygon-sport-analytics';


const SPORT_AREAS_NORM = 358;

@Component({
  selector: 'tp-dashboard-areas-chapter',
  templateUrl: './dashboard-areas-chapter.component.html',
  styleUrls: ['./dashboard-areas-chapter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAreasChapterComponent {

  constructor(
    public readonly sportObjectUtils: SportObjectsService,
  ) { }

  public readonly objectsSubject = new BehaviorSubject<SportObject[]>([]);

  @Input()
  public set objects(value: SportObject[] | null) {
    const updateValue = value ?? [];
    this.objectsSubject.next(updateValue);
  }

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

  public readonly areaTypes = this.areasSubject.pipe(
    map(areas => this.sportObjectUtils.getAreaTypes(areas)),
  );

  public readonly areaTypesChartData = this.areaTypes.pipe(
    map(areaTypes => areaTypes.map(
      type => ({ label: type.type, value: type.names.length }),
    )),
  );

  public readonly areasAmountPercent = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.basicAnalytics.areasAmountPer100k),
    map(amount => Math.floor(amount / SPORT_AREAS_NORM)),
  );

}
