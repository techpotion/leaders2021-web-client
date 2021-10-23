import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { PolygonSportAnalytics } from '../../models/polygon-sport-analytics';

import { LatLng } from '../../../map/models/lat-lng';


@Component({
  selector: 'tp-sport-area-brief-info',
  templateUrl: './sport-area-brief-info.component.html',
  styleUrls: ['./sport-area-brief-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportAreaBriefInfoComponent implements OnInit {

  constructor() { }

  public ngOnInit(): void {
    if (!this.analytics) {
      throw new Error('Cannot create brief info: '
        + 'analytics not passed.');
    }
  }

  @Input()
  public analytics?: PolygonSportAnalytics;

  @Input()
  public polygon?: LatLng[];

  @Input()
  public id = 0;

  @Output()
  public readonly openFull = new EventEmitter<LatLng[]>();

  @Output()
  public readonly closeInfo = new EventEmitter<number>();

  public openFullInfo(): void {
    if (!this.polygon) {
      throw new Error('Cannot open full info: '
        + 'polygon not passed.');
    }
    this.openFull.next(this.polygon);
  }

  public close(): void {
    this.closeInfo.emit(this.id);
  }

}
