import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { createOpacityIncreaseAnimation } from '../../utils/create-opacity-increase-animation';


type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'tp-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    createOpacityIncreaseAnimation(),
  ],
})
export class TooltipComponent {

  constructor() { }

  @Input()
  public text = '';

  @Input()
  public position: TooltipPosition = 'bottom';

  @Input()
  public disabled = false;

  public readonly isOpened = new BehaviorSubject<boolean>(false);

}
