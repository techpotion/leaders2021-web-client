import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
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
  public obj?: SportObject;

  @Output()
  public readonly openFull = new EventEmitter<number>();

  public openFullInfo(): void {
    if (!this.obj) {
      throw new Error('Cannot open full info: '
        + 'no object passed.');
    }
    this.openFull.next(this.obj.objectId);
  }

}
