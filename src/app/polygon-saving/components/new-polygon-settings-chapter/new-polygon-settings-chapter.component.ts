import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { SportPolygonService } from '../../services/sport-polygon.service';

import { SportPolygon } from '../../models/sport-polygon';
import { PolygonSportAnalytics } from '../../models/polygon-sport-analytics';
import { SportArea } from '../../../sport-objects/models/sport-object';
import { LatLng } from '../../../map/models/lat-lng';


@Component({
  selector: 'tp-new-polygon-settings-chapter',
  templateUrl: './new-polygon-settings-chapter.component.html',
  styleUrls: ['./new-polygon-settings-chapter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPolygonSettingsChapterComponent
implements AfterViewInit, OnDestroy {

  constructor(
    public readonly polygonStorage: SportPolygonService,
  ) {
    this.subscriptions.push(
      this.subscribeDisablingInput(),
      this.subscribeOnPolygon(),
      this.subscribeStopSelecting(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngAfterViewInit(): void {
    this.nameInput.nativeElement.focus();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());

    this.clearPolygonDrawing();
  }

  // #endregion


  // #region Name input

  public readonly nameControl = new FormControl('');

  @ViewChild('nameInput')
  public nameInput!: ElementRef<HTMLInputElement>;

  // #endregion


  // #region Drawing polygon

  @Output()
  public readonly drawPolygon = new BehaviorSubject<boolean>(false);

  private subscribeDisablingInput(): Subscription {
    return this.drawPolygon.subscribe(value => {
      if (value && this.nameControl.enabled) {
        this.nameControl.disable();
      } else if (!value && this.nameControl.disabled) {
        this.nameControl.enable();
      }
    });
  }

  private readonly polygonGeometrySubject =
  new BehaviorSubject<LatLng[] | null>(null);

  @Input()
  public set polygonGeometry(value: LatLng[] | null) {
    this.polygonGeometrySubject.next(value);
  }

  // #endregion


  // #region Polygon analytics

  private readonly polygonAreasSubject =
  new BehaviorSubject<SportArea[] | null>(null);

  @Input()
  public set polygonAreas(value: SportArea[] | null) {
    this.polygonAreasSubject.next(value);
  }

  private readonly polygonAnalyticsSubject =
  new BehaviorSubject<PolygonSportAnalytics | null>(null);

  @Input()
  public set polygonAnalytics(value: PolygonSportAnalytics | null) {
    this.polygonAnalyticsSubject.next(value);
  }

  // #endregion


  // #region Polygon

  public readonly polygonSubject: Observable<SportPolygon | null> =
  combineLatest([
    this.nameControl.valueChanges as Observable<string>,
    this.polygonGeometrySubject,
    this.polygonAreasSubject,
    this.polygonAnalyticsSubject,
  ]).pipe(
    map(([name, geometry, areas, analytics]) => {
      if (!name || !name.length
        || !geometry
        || !areas
        || !analytics) { return null; }
      return { name, geometry, areas, analytics };
    }),
  );

  private polygon: SportPolygon | null = null;

  private subscribeOnPolygon(): Subscription {
    return this.polygonSubject.subscribe(polygon => {
      this.polygon = polygon;
    });
  }

  private subscribeStopSelecting(): Subscription {
    return this.polygonSubject.subscribe(polygon => {
      if (polygon) {
        this.drawPolygon.next(false);
      }
    });
  }

  // #endregion


  // #region Saving polygon

  public saveNewPolygon(): void {
    if (!this.polygon) {
      throw new Error('Cannot save polygon: '
        + 'no polygon selected.');
    }
    this.polygonStorage.savePolygon(this.polygon);
    this.clearNewModeValues();
  }

  // #endregion


  // #region Clearing polygon

  private clearPolygonDrawing(): void {
    this.drawPolygon.next(true);
    this.drawPolygon.next(false);
  }

  private clearNewModeValues(): void {
    this.nameControl.reset();
    this.clearPolygonDrawing();
  }

  public clearNewPolygon(): void {
    this.polygonGeometry = null;
    this.drawPolygon.next(true);
  }

  // #endregion

}
