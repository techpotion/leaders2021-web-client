import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  HostListener,
  Input,
  Output,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';
import _ from 'lodash';

import { EnumSelectVariant } from '../../models/enum-select-variant';
import { createSizeIncreaseAnimation } from '../../utils/create-size-increase-animation';


const SEARCH_INPUT_DEBOUNCE_TIME = 300;
const VARIANTS_MAX_HEIGHT = 350;

interface SelectVariant {
  name: string;
  selected: boolean;
  shown: boolean;
  index?: number;
}

@Component({
  selector: 'tp-multiple-select',
  templateUrl: './multiple-select.component.html',
  styleUrls: ['./multiple-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    createSizeIncreaseAnimation('height', VARIANTS_MAX_HEIGHT),
  ],
})
export class MultipleSelectComponent implements OnDestroy {

  constructor(
    public readonly el: ElementRef,
  ) {
    this.subscriptions.push(
      this.subscribeInputFocus(),
      this.subscribeSearchChange(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // #endregion


  // #region Search input

  @ViewChild('searchInput')
  public searchInput!: ElementRef<HTMLInputElement>;

  public readonly searchControl = new FormControl('');

  public subscribeInputFocus(): Subscription {
    return this.isOpened.subscribe(opened => {
      if (opened) {
        this.searchInput.nativeElement.focus();
      } else {
        this.searchControl.setValue('');
      }
    });
  }

  public subscribeSearchChange(): Subscription {
    return this.searchControl.valueChanges.pipe(
      debounceTime(SEARCH_INPUT_DEBOUNCE_TIME),
      distinctUntilChanged(),
    ).subscribe((query: string) => {
      const currentValue = [ ...this.variantsSubject.value ];
      const isEmptyQuery = !query.length;

      for (const variant of currentValue) {
        const shownValue = isEmptyQuery
          || variant.name.toLowerCase().includes(query.toLowerCase());
        variant.shown = shownValue;
      }

      this.variantsSubject.next(currentValue);
    });
  }

  // #endregion


  // #region Appearance

  public readonly isOpened = new BehaviorSubject<boolean>(false);

  public toggleSelect(): void {
    this.isOpened.next(!this.isOpened.value);
  }

  @HostListener('document:click', ['$event'])
  public onClickOutside(event: Event): void {
    // eslint-disable-next-line
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpened.next(false);
    }
  }

  public readonly variantsMaxHeight = VARIANTS_MAX_HEIGHT;

  // #endregion


  // #region Variants

  public readonly variantsSubject = new BehaviorSubject<SelectVariant[]>([]);

  @Input()
  public set variants(value: (string | EnumSelectVariant)[]) {
    const enumVariants = value.map(variant => {
      const index = typeof variant === 'string' ? undefined : variant.index;
      const name = typeof variant === 'string' ? variant : variant.name;
      return { index, name };
    });

    const selectVariants = enumVariants.map(
      variant => ({
        name: variant.name,
        index: variant.index,
        selected: true,
        shown: true,
      }),
    );
    this.variantsSubject.next(selectVariants);
  }

  // #endregion


  // #region Variant selection

  public readonly allVariantsSelected = this.variantsSubject.pipe(
    map(variants => this.areAllSelected(variants)),
  );

  public readonly variantsSelectedCount = this.variantsSubject.pipe(
    map(variants => variants.filter(variant => variant.selected).length),
  );

  public selectVariant(index: number, selected: boolean): void {
    const currentValue = [ ...this.variantsSubject.value ];
    currentValue[index].selected = selected;
    this.variantsSubject.next(currentValue);
  }

  public selectAll(selected?: boolean): void {
    const currentValue = [ ...this.variantsSubject.value ];
    const selectedState = selected ?? !this.areAllSelected(currentValue);

    for (const variant of currentValue) {
      variant.selected = selectedState;
    }

    this.variantsSubject.next(currentValue);
  }

  private areAllSelected(variants: SelectVariant[]): boolean {
    return !variants.filter(
      variant => !variant.selected,
    ).length;
  }

  @Output()
  public readonly variantsSelect = this.variantsSubject.pipe(
    skip(1),
    map(variants => variants.filter(variant => variant.selected)),
    map(variants => variants.map(variant => {
      if (!variant.index) { return variant.name; }
      return { name: variant.name, index: variant.index };
    })),
    distinctUntilChanged((prev, curr) => _.isEqual(prev, curr)),
  );

  // #endregion

}
