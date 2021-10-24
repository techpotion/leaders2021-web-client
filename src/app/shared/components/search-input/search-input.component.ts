import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  HostBinding,
  OnDestroy,
} from '@angular/core';

import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { Subscription } from 'rxjs';


@Component({
  selector: 'tp-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInputComponent),
      multi: true,
    },
  ],
})
export class SearchInputComponent
implements ControlValueAccessor, OnDestroy {

  constructor() {
    this.subscriptions.push(
      this.subscribeValueChange(),
    );
  }

  private readonly subscriptions: Subscription[] = [];

  // #region Life cycle hooks

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // #endregion


  // #region Focus

  @HostBinding('class.focused')
  public isFocused = false;

  // #endregion


  // #region Value

  public readonly inputControl = new FormControl('');

  private subscribeValueChange(): Subscription {
    return this.inputControl.valueChanges.subscribe((value: string) =>
      this.onChange(value));
  }

  // #endregion


  // #region ControlValueAccessor API

  public writeValue(value: string): void {
    this.inputControl.setValue(value);
  }

  // eslint-disable-next-line
  public onChange: (value: string) => void = value => {};

  // eslint-disable-next-line
  public onTouched: () => void = () => {};

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // #endregion

}
