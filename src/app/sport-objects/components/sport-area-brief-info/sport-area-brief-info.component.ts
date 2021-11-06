import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { saveAs } from 'file-saver';

import { SportPolygonService } from '../../../polygon-saving/services/sport-polygon.service';
import { isNotNil } from '../../../shared/utils/is-not-nil';

import { PolygonSportAnalytics, AnalyticsFilterRequest } from '../../../polygon-saving/models/polygon-sport-analytics';
import { SportArea } from '../../models/sport-object';

import { SportAnalyticsApiService } from '../../services/sport-analytics-api.service';


const EXPORT_FILENAME = 'Аналитика полигона.xlsx';

const SAVED_STATE_TIMEOUT = 500;

@Component({
  selector: 'tp-sport-area-brief-info',
  templateUrl: './sport-area-brief-info.component.html',
  styleUrls: ['./sport-area-brief-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportAreaBriefInfoComponent implements OnDestroy {

  constructor(
    public readonly polygonStorage: SportPolygonService,
    public readonly sportAnalyticsApi: SportAnalyticsApiService,
  ) {
    this.subscriptions.push(
      this.subscribeInputFocus(),
      this.subscribeNameReset(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // #endregion


  // #region Analytics

  public readonly analyticsSubject =
  new BehaviorSubject<PolygonSportAnalytics | null>(null);

  @Input()
  public set analytics(value: PolygonSportAnalytics | null) {
    this.analyticsSubject.next(value);
  }

  @Input()
  public areas?: SportArea[];

  public readonly populationDensity = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => Math.floor(analytics.density)),
  );

  public readonly areaTypesAmount = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.areaTypesAmount),
  );

  public readonly sportsAmount = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.sportsAmount),
  );

  public readonly areasSquare = this.analyticsSubject.pipe(
    filter(isNotNil),
    map(analytics => analytics.areasSquare),
  );


  // #endregion


  // #region Open full info

  @Input()
  public filters?: AnalyticsFilterRequest;

  @Output()
  public readonly openFull = new EventEmitter<AnalyticsFilterRequest>();

  public openFullInfo(): void {
    if (!this.filters?.polygon) {
      throw new Error('Cannot open full info: '
        + 'polygon not passed.');
    }
    this.openFull.next(this.filters);
  }

  // #endregion


  // #region Download

  @Output()
  public readonly analyticsDownload = new EventEmitter<boolean>();

  public async download(): Promise<void> {
    if (!this.filters) {
      throw new Error('Cannot download analytics: no polygon passed');
    }

    this.analyticsDownload.emit(true);
    const blob = await this.sportAnalyticsApi.getPolygonAnalyticsBlob(
      this.filters,
    ).toPromise();
    this.analyticsDownload.emit(false);
    saveAs(blob, EXPORT_FILENAME);
  }

  // #endregion


  // #region Close info

  @Output()
  public readonly clearSelection = new EventEmitter<void>();

  // #ednregion


  // #region Selection name

  @ViewChild('selectionNameInput')
  public readonly selectionNameInput!: ElementRef<HTMLInputElement>;

  public readonly selectionNameControl = new FormControl();

  public readonly selectionNameValid =
  this.selectionNameControl.valueChanges.pipe(
    map((value: string | null) => !!value?.length),
  );

  private subscribeInputFocus(): Subscription {
    return this.saveControlsOpened.pipe(
      filter(opened => opened),
    ).subscribe(() => setTimeout(
      () => this.selectionNameInput.nativeElement.focus(),
    ));
  }

  private subscribeNameReset(): Subscription {
    return this.saveControlsOpened.pipe(
      filter(opened => opened),
    ).subscribe(() => this.selectionNameControl.reset());
  }

  // #endregion


  // #region Selection saving

  /**
   * Selection controls state (visible or not).
   */
  public readonly saveControlsOpened = new BehaviorSubject<boolean>(false);

  /**
   * Selection saving component state.
   */
  public readonly savedState =
  new BehaviorSubject<'unsaved' | 'saving' | 'saved'>('unsaved');

  /**
   * Sets component into 'saving' state if it is not already.
   * After SAVED_STATE_TIMEOUT saves polygon.
   */
  public save(): void {
    if (this.savedState.value === 'saving') { return; }

    this.savedState.next('saving');

    setTimeout(() => {
      if (!this.filters?.polygon || !this.analytics || !this.areas) {
        throw new Error('Cannot save polygon: some fields are empty.');
      }

      this.polygonStorage.savePolygon({
        geometry: this.filters.polygon.points,
        name: this.selectionNameControl.value as string,
        analytics: this.analytics,
        areas: this.areas,
      });

      this.savedState.next('saved');
      this.saveControlsOpened.next(false);
    }, SAVED_STATE_TIMEOUT);
  }

  // #endregion

}
