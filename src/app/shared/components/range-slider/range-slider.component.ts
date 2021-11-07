import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, map, filter } from 'rxjs/operators';


const DEFAULT_MAX_VALUE = 100;

@Component({
  selector: 'tp-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeSliderComponent {

  constructor() { }

  @ViewChild('input')
  public inputElement!: ElementRef<HTMLInputElement>;


  // #region Min/max

  public readonly minSubject = new BehaviorSubject<number>(0);

  @Input()
  public set min(value: number) {
    this.minSubject.next(value);
  }

  public readonly maxSubject = new BehaviorSubject<number>(DEFAULT_MAX_VALUE);

  @Input()
  public set max(value: number) {
    this.maxSubject.next(value);
  }

  // #endregion

  // #region Value

  public readonly inputForm = new FormControl(0);

  @Input()
  public set value(value: number) {
    this.inputForm.setValue(value);
  }

  @Output()
  public readonly valueChange = this.inputForm.valueChanges;

  public readonly markerTransform = combineLatest([
    this.inputForm.valueChanges.pipe(
      startWith(this.inputForm.value),
    ),
    this.minSubject,
    this.maxSubject,
  ]).pipe(
    filter(() => !!this.inputElement),
    map(([value, min, max]) =>
      // eslint-disable-next-line
      (this.inputElement.nativeElement.offsetWidth - 40) * value / (max - min),
    ),
  );

  // #endregion

  // #region Units

  @Input()
  public units = '';

  // #endregion

}
