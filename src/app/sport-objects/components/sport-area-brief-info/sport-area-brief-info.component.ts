import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { PolygonSportAnalytics } from '../../models/polygon-sport-analytics';

import { LatLng } from '../../../map/models/lat-lng';


const SAVED_STATE_TIMEOUT = 500;

@Component({
  selector: 'tp-sport-area-brief-info',
  templateUrl: './sport-area-brief-info.component.html',
  styleUrls: ['./sport-area-brief-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportAreaBriefInfoComponent implements OnInit {

  constructor() { }

  // #region Life cycle hooks

  public ngOnInit(): void {
    if (!this.analytics) {
      throw new Error('Cannot create brief info: '
        + 'analytics not passed.');
    }
  }

  // #endregion


  // #region Analytics

  @Input()
  public analytics?: PolygonSportAnalytics;

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


  // #region Close info

  @Output()
  public readonly closeInfo = new EventEmitter<void>();

  @Output()
  public readonly clearSelection = new EventEmitter<void>();

  // #ednregion


  // #region Save

  public readonly selectionNameInput = new FormControl('');

  public readonly saveInputOpened = new BehaviorSubject<boolean>(false);

  public readonly savedState =
  new BehaviorSubject<'unsaved' | 'saving' | 'saved'>('unsaved');

  public save(): void {
    this.savedState.next('saving');
    setTimeout(() => {
      this.savedState.next('saved');
      this.saveInputOpened.next(false);
    }, SAVED_STATE_TIMEOUT);
  }

  public onSaveClick(): void {
    if (this.saveInputOpened.value) {
      this.save();
      this.selectionNameInput.setValue('');
      return;
    }
    this.saveInputOpened.next(true);
  }

  public onCloseInputClick(): void {
    this.saveInputOpened.next(false);
    this.selectionNameInput.setValue('');
  }

  // #endregion

}
