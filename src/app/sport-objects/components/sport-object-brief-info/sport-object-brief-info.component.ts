import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { SportObject } from '../../models/sport-object';

@Component({
  selector: 'tp-sport-object-brief-info',
  templateUrl: './sport-object-brief-info.component.html',
  styleUrls: ['./sport-object-brief-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportObjectBriefInfoComponent {

  constructor() { }

  @Input()
  public obj!: SportObject;

}
