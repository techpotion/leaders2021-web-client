import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
  Input,
  Output,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { tap, map, debounceTime, distinctUntilChanged, skip, startWith } from 'rxjs/operators';
import _ from 'lodash';

import { EnumSelectVariant } from '../../models/enum-select-variant';
import { createSizeIncreaseAnimation } from '../../utils/create-size-increase-animation';


const SEARCH_DEBOUNCE_TIME = 300;
const VARIANTS_MAX_HEIGHT = 350;
const VARIANTS_BUFFER_SIZE = 3;

interface SelectVariant {
  name: string;
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
    public readonly cd: ChangeDetectorRef,
    public readonly el: ElementRef,
  ) {
    this.subscriptions.push(
      this.subscribeInputFocus(),
      this.subscribeVariantsOuterSelected(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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
    this.variantsSubject.next(enumVariants);
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

  public readonly shownVariants = combineLatest([
    this.searchControl.valueChanges.pipe(
      debounceTime(SEARCH_DEBOUNCE_TIME),
      startWith(this.searchControl.value),
      distinctUntilChanged(),
      map(value => value as string),
    ),
    this.variantsSubject,
  ]).pipe(
    map(([input, variants]) => ({
      input,
      variants: variants.map((variant, index) => ({ variant, index })),
    })),
    map(({ input, variants }) => variants.filter(
      variant => variant.variant.name.toLowerCase().includes(
        input.toLowerCase(),
      ),
    )),
  );

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

  public readonly variantsBuffer = VARIANTS_MAX_HEIGHT * VARIANTS_BUFFER_SIZE;

  // #endregion


  // #region Variant selection

  @Input()
  public set selected(value: (string | EnumSelectVariant)[] | undefined) {
    if (!value) {
      this.variantsOuterSelected.next(value);
      return;
    }

    const enumVariants = value.map(variant => {
      const index = typeof variant === 'string' ? undefined : variant.index;
      const name = typeof variant === 'string' ? variant : variant.name;
      return { index, name };
    });
    this.variantsOuterSelected.next(enumVariants);
  }

  public readonly variantsOuterSelected =
  new BehaviorSubject<SelectVariant[] | undefined>(undefined);

  public subscribeVariantsOuterSelected(): Subscription {
    return combineLatest([
      this.variantsOuterSelected.pipe(
        skip(1),
      ),
      this.variantsSubject.pipe(
        skip(1),
      ),
    ]).pipe(
      map(([selected, variants]) => selected ? selected.map(variant =>
        variants.findIndex(
          existingVariant => existingVariant.name === variant.name,
        )) : this.allSelectedArray),
      map(variants => variants.filter(variant => variant !== -1)),
    ).subscribe(variants => this.variantsSelected.next(variants));
  }

  private readonly variantsSelected = new BehaviorSubject<number[]>([]);

  public isVariantSelected(index: number): Observable<boolean> {
    return this.variantsSelected.pipe(
      map(variants => variants.includes(index)),
    );
  }

  public readonly allVariantsSelected = combineLatest([
    this.variantsSubject,
    this.variantsSelected,
  ]).pipe(
    map(([variants, selectedVariants]) =>
      variants.length === selectedVariants.length),
  );

  public readonly variantsSelectedCount = this.variantsSelected.pipe(
    map(variants => variants.length),
  );

  public selectVariant(index: number): void {
    let currentValue = [ ...this.variantsSelected.value ];

    if (currentValue.includes(index)) {
      currentValue = currentValue.filter(
        variantIndex => variantIndex !== index,
      );
    } else {
      currentValue.push(index);
    }

    this.variantsSelected.next(currentValue);
  }

  public selectAll(selected?: boolean): void {
    const selectedState = selected ?? !this.areAllSelected();

    if (selectedState) {
      this.variantsSelected.next(this.allSelectedArray);
    } else {
      this.variantsSelected.next([]);
    }
  }

  private get allSelectedArray(): number[] {
    const allVariants = [];
    for (let i = 0; i < this.variantsSubject.value.length; i++) {
      allVariants[i] = i;
    }
    return allVariants;
  }

  private areAllSelected(): boolean {
    return this.variantsSelected.value.length
      === this.variantsSubject.value.length;
  }

  @Output()
  public readonly variantsSelect = combineLatest([
    this.variantsSubject.pipe(
      skip(1),
    ),
    this.variantsSelected.pipe(
      skip(1),
    ),
  ]).pipe(
    map(([variants, variantsSelected]) =>
      variants.filter((_, index) => variantsSelected.includes(index))),
    map(variants => variants.map(variant => {
      if (!variant.index) { return variant.name; }
      return { name: variant.name, index: variant.index };
    })),
    distinctUntilChanged((prev, curr) => _.isEqual(prev, curr)),
  );

  // #endregion

}
