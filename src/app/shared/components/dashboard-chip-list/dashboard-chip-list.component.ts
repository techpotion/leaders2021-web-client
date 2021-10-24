import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'tp-dashboard-chip-list',
  templateUrl: './dashboard-chip-list.component.html',
  styleUrls: ['./dashboard-chip-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChipListComponent {

  constructor() { }

  public readonly chipsSubject = new BehaviorSubject<string[]>([]);

  @Input()
  public set chips(value: string[] | null) {
    const updateValue = value ?? [];
    this.chipsSubject.next(updateValue);
  }

}
