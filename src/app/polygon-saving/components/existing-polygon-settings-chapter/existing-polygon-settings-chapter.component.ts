import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, combineLatest } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';

import { SportPolygonService } from '../../services/sport-polygon.service';

import { SportPolygon } from '../../models/sport-polygon';

const SEARCH_DEBOUNCE_TIME = 300;

@Component({
  selector: 'tp-existing-polygon-settings-chapter',
  templateUrl: './existing-polygon-settings-chapter.component.html',
  styleUrls: ['./existing-polygon-settings-chapter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistingPolygonSettingsChapterComponent implements OnDestroy {

  constructor(
    public readonly polygonStorage: SportPolygonService,
  ) { }


  // #region Lifecycle hooks

  public ngOnDestroy(): void {
    this.clearViewedPolygon();
  }

  // #endregion


  // #region Search input

  public readonly searchInput = new FormControl('');

  // #endregion


  // #region Polygons

  public readonly polygons = new BehaviorSubject<SportPolygon[]>(
    this.polygonStorage.getPolygons(),
  );

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

  // #endregion


  // #region Removing polygons

  public removePolygon(index: number): void {
    const viewedIndex = this.viewedPolygonIndex.value;
    if (index === viewedIndex) {
      this.viewedPolygonIndex.next(undefined);
    }
    if (viewedIndex && index < viewedIndex) {
      this.viewedPolygonIndex.next(viewedIndex - 1);
    }

    const polygons = this.polygons.value;
    polygons.splice(index, 1);
    this.polygonStorage.updatePolygons(polygons);
    this.polygons.next(this.polygonStorage.getPolygons());
  }

  // #endregion


  // #region Viewing polygons

  public readonly viewedPolygonIndex =
  new BehaviorSubject<number | undefined>(undefined);

  @Output()
  public readonly polygonView = combineLatest([
    this.polygons,
    this.viewedPolygonIndex,
  ]).pipe(
    map(([polygons, chosenIndex]) =>
      chosenIndex === undefined
        ? null
        : [ ...polygons[chosenIndex].geometry ]),
  );

  public viewPolygon(index: number, selected: boolean): void {
    if (!selected && this.viewedPolygonIndex.value === index) {
      this.clearViewedPolygon();
      return;
    }
    this.viewedPolygonIndex.next(index);
  }

  private clearViewedPolygon(): void {
    this.viewedPolygonIndex.next(undefined);
  }

  @Input()
  public set clearEvent(event: [] | null) {
    if (event) {
      this.clearViewedPolygon();
    }
  }

  // #endregion

}
