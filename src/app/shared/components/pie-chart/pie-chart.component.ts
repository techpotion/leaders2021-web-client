import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  ViewChild,
  OnDestroy,
} from '@angular/core';

import { Chart, registerables } from 'chart.js';
import {
  BehaviorSubject,
  combineLatest,
  Subject,
  Subscription,
} from 'rxjs';
import { filter } from 'rxjs/operators';

import { PieChartData } from '../../models/pie-chart-data';


Chart.register(...registerables);

@Component({
  selector: 'tp-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartComponent implements AfterViewInit, OnDestroy {

  constructor() {
    this.subscriptions.push(
      this.subscribeOnData(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngAfterViewInit(): void {
    this.viewInitSubject.next();
  }

  public readonly viewInitSubject = new Subject<void>();

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // #endregion


  // #region Chart

  @ViewChild('chart')
  public readonly chartElement!: ElementRef<HTMLCanvasElement>;

  public chart?: Chart;

  private initChart(data: PieChartData[]): void {
    const context = this.chartElement.nativeElement.getContext('2d');
    if (!context) {
      throw new Error('Cannot init chart: context is not loaded.');
    }
    this.chart = new Chart(context, {
      type: 'pie',
      data: {
        labels: data.map(element => element.label),
        datasets: [{
          data: data.map(element => element.value),
          backgroundColor: [
            '#F6DCDE',
            '#FFFFFF',
            '#6C82C1',
            '#193C9D',
            '#EE2D1E',
            '#DAE0EF',
          ],
          borderColor: '#DAE0EF',
          borderWidth: 1,
        }],
      },
      options: {
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 4,
              boxHeight: 12,
              padding: 20,
              font: { family: 'Inter', size: 16 },
            },
          },
        },
      },
    });
  }

  // #endregion


  // #region Data

  @Input()
  public set data(value: PieChartData[] | null) {
    const updateData = value ?? [];
    this.dataSubject.next(updateData);
  }

  public readonly dataSubject = new BehaviorSubject<PieChartData[]>([]);

  public subscribeOnData(): Subscription {
    return combineLatest([
      this.viewInitSubject,
      this.dataSubject.pipe(
        filter(data => !!data.length),
      ),
    ]).subscribe(([, data]) => this.initChart(data));
  }

  // #endregion

}
