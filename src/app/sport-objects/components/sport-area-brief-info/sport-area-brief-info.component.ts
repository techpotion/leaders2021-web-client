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

import { SportPolygonService } from '../../../polygon-saving/services/sport-polygon.service';
import { isNotNil } from '../../../shared/utils/is-not-nil';

import { PolygonSportAnalytics } from '../../../polygon-saving/models/polygon-sport-analytics';
import { SportArea } from '../../models/sport-object';
import { LatLng } from '../../../map/models/lat-lng';


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
  public polygon?: LatLng[];

  @Output()
  public readonly openFull = new EventEmitter<LatLng[]>();

  public openFullInfo(): void {
    if (!this.polygon) {
      throw new Error('Cannot open full info: '
        + 'polygon not passed.');
    }
    this.openFull.next(this.polygon);
  }

  // #endregion


  // #region Download

  public download(): void {
    console.warn('Download method not implemented');
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
      if (!this.polygon || !this.analytics || !this.areas) {
        throw new Error('Cannot save polygon: some fields are empty.');
      }

      this.polygonStorage.savePolygon({
        geometry: this.polygon,
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
