import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'tp-density-info',
  templateUrl: './density-info.component.html',
  styleUrls: ['./density-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DensityInfoComponent {

  constructor() { }

  public readonly populationSubject = new BehaviorSubject<number | null>(null);

  @Input()
  public set population(value: number | null) {
    this.populationSubject.next(value);
  }

  public readonly objectsSubject = new BehaviorSubject<number | null>(null);

  @Input()
  public set objects(value: number | null) {
    this.objectsSubject.next(value);
  }

  public readonly bothExist = combineLatest([
    this.populationSubject,
    this.objectsSubject,
  ]).pipe(
    map(([population, objects]) => population !== null && objects !== null),
  );

}
