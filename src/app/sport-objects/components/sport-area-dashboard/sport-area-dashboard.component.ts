import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { SportObject, SportArea } from '../../models/sport-object';
import { FullPolygonAnalytics } from '../../../polygon-saving/models/polygon-sport-analytics';


type DashboardMode = 'areas' | 'area-types' | 'analytics';
const DEFAULT_MODE: DashboardMode = 'areas';

@Component({
  selector: 'tp-sport-area-dashboard',
  templateUrl: './sport-area-dashboard.component.html',
  styleUrls: ['./sport-area-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportAreaDashboardComponent {

  constructor(
    public readonly el: ElementRef<HTMLElement>,
  ) { }

  public readonly mode = new BehaviorSubject<DashboardMode>(DEFAULT_MODE);

  public readonly objectsSubject = new BehaviorSubject<SportObject[]>([]);

  @Input()
  public set objects(value: SportObject[] | null) {
    const updateValue = value ?? [];
    this.objectsSubject.next(updateValue);
  }

  public readonly areasSubject = new BehaviorSubject<SportArea[]>([]);

  @Input()
  public set areas(value: SportArea[] | null) {
    const updateValue = value ?? [];
    this.areasSubject.next(updateValue);
  }

  public readonly analyticsSubject =
  new BehaviorSubject<FullPolygonAnalytics | null>(null);

  @Input()
  public set analytics(value: FullPolygonAnalytics | null) {
    this.analyticsSubject.next(value);
  }

  @Output()
  public readonly closeDashboard = new EventEmitter<void>();

}
