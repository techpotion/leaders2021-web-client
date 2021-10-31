import {
  Component,
  ChangeDetectionStrategy,
  Output,
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
export class ExistingPolygonSettingsChapterComponent {

  constructor(
    public readonly polygonStorage: SportPolygonService,
  ) { }


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
    if (index === this.viewedPolygonIndex.value) {
      this.viewedPolygonIndex.next(undefined);
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
      this.viewedPolygonIndex.next(undefined);
      return;
    }
    this.viewedPolygonIndex.next(index);
  }

  // #endregion

}
