import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { saveAs } from 'file-saver';

import { SportAnalyticsApiService } from '../../services/sport-analytics-api.service';

import { SportObject, SportArea } from '../../models/sport-object';
import { FullPolygonAnalytics } from '../../../polygon-saving/models/polygon-sport-analytics';


type DashboardMode = 'areas' | 'area-types' | 'analytics';
const DEFAULT_MODE: DashboardMode = 'areas';
const EXPORT_FILENAME = 'Аналитика полигона.xlsx';

@Component({
  selector: 'tp-sport-area-dashboard',
  templateUrl: './sport-area-dashboard.component.html',
  styleUrls: ['./sport-area-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportAreaDashboardComponent {

  constructor(
    public readonly el: ElementRef<HTMLElement>,
    public readonly sportAnalyticsApi: SportAnalyticsApiService,
  ) { }


  // #region Mode

  public readonly mode = new BehaviorSubject<DashboardMode>(DEFAULT_MODE);

  @Input()
  public filtersEnabled = false;

  // #endregion


  // #region Objects

  public readonly objectsSubject = new BehaviorSubject<SportObject[]>([]);

  @Input()
  public set objects(value: SportObject[] | null) {
    const updateValue = value ?? [];
    this.objectsSubject.next(updateValue);
  }

  // #endregion


  // #region Areas

  public readonly areasSubject = new BehaviorSubject<SportArea[]>([]);

  @Input()
  public set areas(value: SportArea[] | null) {
    const updateValue = value ?? [];
    this.areasSubject.next(updateValue);
  }

  // #endregion


  // #region Analytics

  public readonly analyticsSubject =
  new BehaviorSubject<FullPolygonAnalytics | null>(null);

  @Input()
  public set analytics(value: FullPolygonAnalytics | null) {
    this.analyticsSubject.next(value);
  }

  // #endregion Analytics


  // #region Export

  @Output()
  public readonly analyticsExport = new EventEmitter<boolean>();

  public async exportAnalytics(): Promise<void> {
    if (!this.analyticsSubject.value) {
      throw new Error('Cannot export analytics: no data provided.');
    }

    this.analyticsExport.emit(true);
    const blob = await this.sportAnalyticsApi.getAnalyticsBlob(
      this.analyticsSubject.value,
    ).toPromise();
    this.analyticsExport.emit(false);
    saveAs(blob, EXPORT_FILENAME);
  }

  // #endregion

  @Output()
  public readonly closeDashboard = new EventEmitter<void>();

}
