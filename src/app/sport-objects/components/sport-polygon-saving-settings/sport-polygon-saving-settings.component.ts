import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, Subscription } from 'rxjs';

import { SportPolygonService } from '../../services/sport-polygon.service';

import { SportPolygon } from '../../models/sport-polygon';


type SettingsMode = 'new' | 'existing';
const DEFAULT_MODE: SettingsMode = 'new';

@Component({
  selector: 'tp-sport-polygon-saving-settings',
  templateUrl: './sport-polygon-saving-settings.component.html',
  styleUrls: ['./sport-polygon-saving-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportPolygonSavingSettingsComponent implements OnDestroy {

  constructor(
    public readonly polygonStorage: SportPolygonService,
  ) {
    this.subscriptions.push(
      this.subscribeOnClose(),
      this.subscribeNewPolygonInput(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // #endregion


  // #region Mode

  public readonly mode = new BehaviorSubject<SettingsMode>(DEFAULT_MODE);

  // #endregion


  // #region Close

  @Output()
  public readonly closeSettings = new EventEmitter<void>();

  public onCloseClick(): void {
    this.closeSettings.emit();
  }

  public clearComponent(): void {
    this.mode.next(DEFAULT_MODE);
    this.clearNewModeValues();
  }

  public subscribeOnClose(): Subscription {
    return this.closeSettings.subscribe(() =>
      this.clearComponent());
  }

  // #endregion


  // #region 'New' mode

  public readonly newPolygonName = new FormControl('');

  @Output()
  public readonly selectPolygon =
  new BehaviorSubject<string | null>(null);

  public readonly newPolygonSubject =
  new BehaviorSubject<SportPolygon | null>(null);

  @Input()
  public set newPolygon(value: SportPolygon | null) {
    if (!value) { return; }
    this.newPolygonSubject.next(value);
    this.selectPolygon.next(null);
  }

  private subscribeNewPolygonInput(): Subscription {
    return this.selectPolygon.subscribe(name => {
      if (name) {
        this.newPolygonName.disable();
      }
    });
  }

  private clearNewModeValues(): void {
    this.newPolygonName.reset();
    this.selectPolygon.next(null);
    this.newPolygonSubject.next(null);
    this.newPolygonName.enable();
  }

  public saveNewPolygon(): void {
    if (!this.newPolygonSubject.value) {
      throw new Error('Cannot save polygon: '
        + 'no polygon selected.');
    }
    this.polygonStorage.savePolygon(this.newPolygonSubject.value);
    this.clearNewModeValues();
  }

  public clearNewPolygon(): void {
    this.newPolygonSubject.next(null);
    this.selectPolygon.next(this.newPolygonName.value);
  }

  // #endregion

}
