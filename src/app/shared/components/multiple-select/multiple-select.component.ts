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
import { map, distinctUntilChanged } from 'rxjs/operators';
import _ from 'lodash';


interface SelectVariant {
  name: string;
  selected: boolean;
  shown: boolean;
}

@Component({
  selector: 'tp-multiple-select',
  templateUrl: './multiple-select.component.html',
  styleUrls: ['./multiple-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    return this.searchControl.valueChanges.subscribe(query => {
      const currentValue = [ ...this.variantsSubject.value ];
      const isEmptyQuery = !(query as string).length;

      for (const variant of currentValue) {
        const shownValue = isEmptyQuery || variant.name.includes(query);
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
    // esling-disable-next-line
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpened.next(false);
    }
  }

  // #endregion


  // #region Variants

  public readonly variantsSubject = new BehaviorSubject<SelectVariant[]>([]);

  @Input()
  public set variants(value: string[]) {
    const selectVariants = value.map(
      name => ({ name, selected: true, shown: true }),
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
    map(variants => variants.map(variant => variant.name)),
    distinctUntilChanged((prev, curr) => _.isEqual(prev, curr)),
  );

  // #endregion

}
