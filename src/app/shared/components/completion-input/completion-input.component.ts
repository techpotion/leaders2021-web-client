import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  OnDestroy,
} from '@angular/core';

import { FormControl } from '@angular/forms';

import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, debounceTime, map } from 'rxjs/operators';


const INPUT_DEBOUNCE_TIME = 300;
const COMPLETION_VARIANTS_COUNT = 3;

@Component({
  selector: 'tp-completion-input',
  templateUrl: './completion-input.component.html',
  styleUrls: ['./completion-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletionInputComponent implements OnDestroy {

  constructor(
    public readonly el: ElementRef,
  ) {
    this.subscriptions.push(
      this.subscribeFocus(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // #endregion


  // #region Completion opened state

  @HostListener('document:click', ['$event'])
  public onClickOutside(event: Event): void {
    // eslint-disable-next-line
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpened.next(false);
    }
  }

  public readonly isOpened = new BehaviorSubject<boolean>(false);

  public subscribeFocus(): Subscription {
    return this.isFocused.subscribe(value => {
      if (value) {
        this.toggleCompletion(true);
      }
    });
  }

  public toggleCompletion(value?: boolean): void {
    const updateValue = value ?? !this.isOpened.value;
    this.isOpened.next(updateValue);
  }

  // #endregion


  // #region Appearance

  @Input()
  public placeholder = '';

  // #endregion


  // #region Input control

  public readonly isFocused = new BehaviorSubject<boolean>(false);

  public readonly inputControl = new FormControl('');

  // #endregion


  // #region Completion

  @Input()
  public variants: string[] = [];

  public completionVariants = this.inputControl.valueChanges.pipe(
    debounceTime(INPUT_DEBOUNCE_TIME),
    distinctUntilChanged(),
    map((input: string) => this.variants.filter(variant =>
      variant.toLowerCase().includes(input.toLowerCase()))),
    map(variants => variants.slice(0, COMPLETION_VARIANTS_COUNT)),
  );

  public selectVariant(variant: string): void {
    this.inputControl.setValue(variant);
    this.toggleCompletion(false);
    this.search();
  }

  // #endregion


  // #region Search

  @Output()
  public readonly searchChange = new EventEmitter<string>();

  public search(): void {
    this.searchChange.next(this.inputControl.value);
  }

  // #endregion

}
