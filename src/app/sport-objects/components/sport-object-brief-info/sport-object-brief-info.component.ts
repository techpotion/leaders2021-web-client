import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';

import { SportObject } from '../../models/sport-object';


@Component({
  selector: 'tp-sport-object-brief-info',
  templateUrl: './sport-object-brief-info.component.html',
  styleUrls: ['./sport-object-brief-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportObjectBriefInfoComponent implements OnInit {

  constructor() { }

  public ngOnInit(): void {
    if (!this.obj) {
      throw new Error('Cannot initialize brief info: '
        + 'no object passed.');
    }
  }

  @Input()
  public obj?: SportObject = {
    objectId: 1,
    objectName: 'sdfsfsgfdg',
    objectAddress: 'dfsjgfsijgifdjg',
    objectPoint: { lat: 0, lng: 0 },
    departmentalOrganizationId: 1,
    departmentalOrganizationName: 'dfkglsfjglkfdjg',
    availability: 1,
    objectSumSquare: 1,
  };

}
