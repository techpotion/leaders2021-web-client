import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';


type SettingsMode = 'new' | 'existing';
const DEFAULT_MODE: SettingsMode = 'new';

@Component({
  selector: 'tp-sport-polygon-saving-settings',
  templateUrl: './sport-polygon-saving-settings.component.html',
  styleUrls: ['./sport-polygon-saving-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportPolygonSavingSettingsComponent {

  constructor() { }

  // #region Mode

  public readonly mode = new BehaviorSubject<SettingsMode>(DEFAULT_MODE);

  // #endregion


  // #region Close

  @Output()
  public readonly closeSettings = new EventEmitter<void>();

  public onCloseClick(): void {
    this.closeSettings.emit();
    this.mode.next(DEFAULT_MODE);
  }

  // #endregion


  // #region 'New' mode

  public readonly newPolygonName = new FormControl('');

  // #endregion

}
