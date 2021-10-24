import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { PieChartData } from '../../models/pie-chart-data';


@Component({
  selector: 'tp-dashboard-pie-chart',
  templateUrl: './dashboard-pie-chart.component.html',
  styleUrls: ['./dashboard-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPieChartComponent {

  constructor() { }

  @Input()
  public title = '';

  @Input()
  public data: PieChartData[] | null = null;

}
