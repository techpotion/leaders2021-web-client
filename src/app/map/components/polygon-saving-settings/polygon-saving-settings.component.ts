import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BehaviorSubject } from 'rxjs';


type settingsMode = 'new' | 'existing';

@Component({
  selector: 'tp-polygon-saving-settings',
  templateUrl: './polygon-saving-settings.component.html',
  styleUrls: ['./polygon-saving-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolygonSavingSettingsComponent {

  constructor() { }

  public readonly mode = new BehaviorSubject<settingsMode>('new');

}
