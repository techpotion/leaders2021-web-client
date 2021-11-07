import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';


const MIN_RADIUS = 500;
const MAX_RADIUS = 5000;

@Component({
  selector: 'tp-quick-analytics-controls',
  templateUrl: './quick-analytics-controls.component.html',
  styleUrls: ['./quick-analytics-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAnalyticsControlsComponent {

  constructor() { }

  public readonly minRadius = MIN_RADIUS;

  public readonly maxRadius = MAX_RADIUS;

  @Output()
  public readonly radiusChange = new EventEmitter<number>();

}
