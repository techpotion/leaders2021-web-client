import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import {
  filter,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';

import { SportPolygonService } from '../../services/sport-polygon.service';

import { SportPolygon } from '../../models/sport-polygon';


type SettingsMode = 'new' | 'existing';
const DEFAULT_MODE: SettingsMode = 'existing';
const SEARCH_DEBOUNCE_TIME = 300;

@Component({
  selector: 'tp-sport-polygon-saving-settings',
  templateUrl: './sport-polygon-saving-settings.component.html',
  styleUrls: ['./sport-polygon-saving-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportPolygonSavingSettingsComponent implements OnDestroy {

  constructor(
    public readonly polygonStorage: SportPolygonService,
  ) {
    this.subscriptions.push(
      this.subscribeOnClose(),
      this.subscribeNewPolygonInput(),
      this.subscribeOnModeChange(),
    );
  }

  private readonly subscriptions: Subscription[] = [];


  // #region Life cycle hooks

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // #endregion


  // #region Mode

  public readonly mode = new BehaviorSubject<SettingsMode>(DEFAULT_MODE);

  // #endregion


  // #region Close

  @Output()
  public readonly closeSettings = new EventEmitter<void>();

  public onCloseClick(): void {
    this.closeSettings.emit();
  }

  public clearComponent(): void {
    this.mode.next(DEFAULT_MODE);
    this.clearNewModeValues();
  }

  public subscribeOnClose(): Subscription {
    return this.closeSettings.subscribe(() =>
      this.clearComponent());
  }

  // #endregion


  // #region 'New' mode

  public readonly newPolygonName = new FormControl('');

  @Output()
  public readonly selectPolygon =
  new BehaviorSubject<string | null>(null);

  public readonly newPolygonSubject =
  new BehaviorSubject<SportPolygon | null>(null);

  @Input()
  public set newPolygon(value: SportPolygon | null) {
    if (!value) { return; }
    this.newPolygonSubject.next(value);
    this.selectPolygon.next(null);
  }

  private subscribeNewPolygonInput(): Subscription {
    return this.selectPolygon.subscribe(name => {
      if (name) {
        this.newPolygonName.disable();
      }
    });
  }

  private clearNewModeValues(): void {
    this.newPolygonName.reset();
    this.selectPolygon.next(null);
    this.newPolygonSubject.next(null);
    this.newPolygonName.enable();
  }

  public saveNewPolygon(): void {
    if (!this.newPolygonSubject.value) {
      throw new Error('Cannot save polygon: '
        + 'no polygon selected.');
    }
    this.polygonStorage.savePolygon(this.newPolygonSubject.value);
    this.clearNewModeValues();
  }

  public clearNewPolygon(): void {
    this.newPolygonSubject.next(null);
    this.selectPolygon.next(this.newPolygonName.value);
  }

  // #endregion


  // #region 'Existing' mode

  public readonly inputContainerFocus = new BehaviorSubject<boolean>(false);

  public readonly searchInput = new FormControl('');

  public readonly polygons = new BehaviorSubject<SportPolygon[]>([]);

  public readonly shownPolygons = combineLatest([
    this.searchInput.valueChanges.pipe(
      startWith(this.searchInput.value),
      debounceTime(SEARCH_DEBOUNCE_TIME),
      distinctUntilChanged(),
      map(value => value as string),
    ),
    this.polygons,
  ]).pipe(
    map(([input, polygons]) => ({
      input,
      polygons: polygons.map((polygon, index) => ({ polygon, index })),
    })),
    map(({ input, polygons }) => polygons.filter(
      polygon => polygon.polygon.name.includes(input),
    )),
  );

  private subscribeOnModeChange(): Subscription {
    return this.mode.pipe(
      filter(mode => mode === 'existing'),
    ).subscribe(() => this.polygons.next(
      this.polygonStorage.getPolygons(),
    ));
  }

  public removePolygon(index: number): void {
    if (index === this.chosenPolygonIndex.value) {
      this.chosenPolygonIndex.next(undefined);
    }

    const polygons = this.polygons.value;
    polygons.splice(index, 1);
    this.polygonStorage.updatePolygons(polygons);
    this.polygons.next(this.polygonStorage.getPolygons());
  }

  public readonly chosenPolygonIndex =
  new BehaviorSubject<number | undefined>(undefined);

  @Output()
  public readonly polygonChoose = combineLatest([
    this.polygons,
    this.chosenPolygonIndex,
  ]).pipe(
    map(([polygons, chosenIndex]) =>
      chosenIndex === undefined
        ? null
        : [ ...polygons[chosenIndex].geometry ]),
  );

  public choosePolygon(index: number, selected: boolean): void {
    if (!selected && this.chosenPolygonIndex.value === index) {
      this.chosenPolygonIndex.next(undefined);
      return;
    }
    this.chosenPolygonIndex.next(index);
  }

  // #endregion

}
