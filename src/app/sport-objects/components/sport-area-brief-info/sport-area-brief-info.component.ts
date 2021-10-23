import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';

import { PolygonSportAnalytics } from '../../models/polygon-sport-analytics';


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
  public analytics?: PolygonSportAnalytics = {
    areasSquare: 15,
    areasSquearePer100k: 0,
    areasAmount: 0,
    areasAmountPer100k: 0,
    sportsAmount: 150,
    sportsAmountPer100k: 0,
    sportKinds: [],
    areaTypes: [],
    areaTypesAmount: 15,
  };

}
