import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { ChartLegendItem } from '../../models/chart-legend';


@Component({
  selector: 'tp-chart-legend',
  templateUrl: './chart-legend.component.html',
  styleUrls: ['./chart-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLegendComponent {

  constructor() { }

  public readonly itemsSubject = new BehaviorSubject<ChartLegendItem[]>([]);

  @Input()
  public set items(value: ChartLegendItem[] | null) {
    const updateItems = value ?? [];
    this.itemsSubject.next(updateItems);
  }

}
