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
  SportObject,
} from '../../models/sport-object';

import { SportObjectsService } from '../../services/sport-objects.service';


@Component({
  selector: 'tp-sport-object-full-info',
  templateUrl: './sport-object-full-info.component.html',
  styleUrls: ['./sport-object-full-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportObjectFullInfoComponent {

  constructor(
    public readonly sportObjectUtils: SportObjectsService,
  ) { }

  @Input()
  public obj?: SportObject;

  private readonly sportAreasSubject = new BehaviorSubject<SportArea[]>([]);

  public readonly sportAreaTypes = this.sportAreasSubject.pipe(
    map(areas => this.sportObjectUtils.getAreaTypes(areas)),
  );

  public readonly sportKinds = this.sportAreasSubject.pipe(
    map(areas => this.sportObjectUtils.getSportKinds(areas)),
  );

  @Input()
  public set sportAreas(value: SportArea[] | undefined) {
    const updateValue = value ?? [];
    this.sportAreasSubject.next(updateValue);
  }

  public readonly availabilityDecription: {
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
  public readonly infoClose = new EventEmitter<void>();

}
