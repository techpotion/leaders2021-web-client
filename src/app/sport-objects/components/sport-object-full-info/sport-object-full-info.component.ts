import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  SportArea,
  SportAreaType,
  SportObject,
} from '../../models/sport-object';


@Component({
  selector: 'tp-sport-object-full-info',
  templateUrl: './sport-object-full-info.component.html',
  styleUrls: ['./sport-object-full-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportObjectFullInfoComponent {

  constructor() { }

  @Input()
  public obj?: SportObject;

  private readonly sportAreasSubject = new BehaviorSubject<SportArea[]>([]);

  public readonly sportAreaTypes = this.sportAreasSubject.pipe(
    map(areas => this.getAreaTypes(areas)),
  );

  public readonly sportKinds = this.sportAreasSubject.pipe(
    map(areas => {
      const kinds: string[] = [];
      for (const area of areas) {
        if (kinds.includes(area.sportKind)) {
          continue;
        }
        kinds.push(area.sportKind);
      }
      return kinds;
    }),
  );

  @Input()
  public set sportAreas(value: SportArea[] | undefined) {
    const updateValue = value ?? [];
    this.sportAreasSubject.next(updateValue);
  }

  private getAreaTypes(areas: SportArea[]): SportAreaType[] {
    const types: SportAreaType[] = [];
    for (const area of areas) {
      let type = types.find(type => type.type === area.sportsAreaType);
      if (!type) {
        type = { type: area.sportsAreaType, names: [] };
        types.push(type);
      }
      type.names.push(area.sportsAreaName);
    }
    return types;
  }

  public availabilityDecription: {
    [key: string]: {
      name: string;
      icon: string;
    };
  } = {
    '1': {
      name: 'Городская',
      icon: 'assets/availability/subway.svg',
    },
    '2': {
      name: 'Окружная',
      icon: 'assets/availability/car.svg',
    },
    '3': {
      name: 'Районная',
      icon: 'assets/availability/bicycle.svg',
    },
    '4': {
      name: 'Шаговая',
      icon: 'assets/availability/walking.svg',
    },
  };

  @Output()
  public readonly close = new EventEmitter<void>();

}
