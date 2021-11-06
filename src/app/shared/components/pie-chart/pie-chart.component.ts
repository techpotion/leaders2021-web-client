import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { ChartLegendItem } from '../../models/chart-legend';


Chart.register(...registerables);

@Component({
  selector: 'tp-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartComponent implements AfterViewInit, OnDestroy {

  constructor(
    public readonly cd: ChangeDetectorRef,
  ) {
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
    this.chart?.destroy();
    this.chart = new Chart(context, {
      type: 'pie',
      data: {
        labels: data.map(element => element.label),
        datasets: [{
          data: data.map(element => element.value),
          backgroundColor: [
            '#EBB0B5',
            '#6C82C1',
            '#193C9D',
            '#EE2D1E',
            '#ACB9DC',
          ],
          borderColor: '#DAE0EF',
          borderWidth: 1,
        }],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#193C9D',
            titleColor: '#FFFFFF',
            titleFont: { family: 'Inter', size: 14 },
          },
        },
      },
    });

    this.generateLegend();
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


  // #region Legend

  public readonly legend = new BehaviorSubject<ChartLegendItem[]>([]);

  private generateLegend(): void {
    if (!this.chart) {
      throw new Error('Cannot generate legend: no chart found.');
    }
    const labelGenerator =
    this.chart.options.plugins?.legend?.labels?.generateLabels;
    if (labelGenerator) {
      const labels = labelGenerator(this.chart).filter(
        item => !!item.fillStyle,
      ).map(item => ({
        title: item.text,
        color: item.fillStyle as string,
      }));
      this.legend.next(labels);
      this.cd.detectChanges();
    }
  }

  // #endregion

}
