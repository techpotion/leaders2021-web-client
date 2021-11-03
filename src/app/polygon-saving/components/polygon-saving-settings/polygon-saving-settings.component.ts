import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { BehaviorSubject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SportPolygonService } from '../../services/sport-polygon.service';
import { SportObjectsApiService } from '../../../sport-objects/services/sport-objects-api.service';
import { SportAnalyticsApiService } from '../../../sport-objects/services/sport-analytics-api.service';

import { LatLng } from '../../../map/models/lat-lng';


type SettingsMode = 'new' | 'existing';
const DEFAULT_MODE: SettingsMode = 'existing';

@Component({
  selector: 'tp-polygon-saving-settings',
  templateUrl: './polygon-saving-settings.component.html',
  styleUrls: ['./polygon-saving-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolygonSavingSettingsComponent {

  constructor(
    public readonly polygonStorage: SportPolygonService,
    public readonly objectsApi: SportObjectsApiService,
    public readonly analyticsApi: SportAnalyticsApiService,
  ) { }


  // #region Mode

  public readonly mode = new BehaviorSubject<SettingsMode>(DEFAULT_MODE);

  // #endregion


  // #region Close

  @Output()
  public readonly closeSettings = new EventEmitter<void>();

  public onCloseClick(): void {
    this.closeSettings.emit();
  }

  // #endregion


  // #region 'New' mode

  @Output()
  public readonly drawPolygon = new EventEmitter<boolean>();

  public readonly newPolygonGeometry =
  new BehaviorSubject<LatLng[] | null>(null);

  @Input()
  public set newPolygon(value: LatLng[] | null) {
    this.newPolygonGeometry.next(value);
  }

  public readonly newPolygonAreas = this.newPolygonGeometry.pipe(
    switchMap(polygon => {
      if (!polygon) { return of(null); }
      return this.objectsApi.getFilteredAreas({
        polygon: { points: polygon },
      });
    }),
  );

  public readonly newPolygonAnalytics = this.newPolygonGeometry.pipe(
    switchMap(polygon => {
      if (!polygon) { return of(null); }
      return this.analyticsApi.getPolygonAnalytics(polygon);
    }),
  );

  // #endregion


  // #region 'Existing' mode

  @Output()
  public readonly polygonView = new EventEmitter<LatLng[] | null>();

  // #endregion

}
