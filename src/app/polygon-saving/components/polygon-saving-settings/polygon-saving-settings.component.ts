import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { SportPolygonService } from '../../services/sport-polygon.service';

import { SportPolygon } from '../../models/sport-polygon';
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
  public readonly selectPolygon =
  new EventEmitter<string | null>();

  @Input()
  public newPolygon: SportPolygon | null = null;

  // #endregion


  // #region 'Existing' mode

  @Output()
  public readonly polygonChoose = new EventEmitter<LatLng[] | null>();

  // #endregion

}
