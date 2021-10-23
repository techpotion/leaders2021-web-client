import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import { SportPolygon } from '../../models/sport-polygon';

import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { isNotNil } from '../../../shared/utils/is-not-nil';
import { SportObjectsService } from '../../../sport-objects/services/sport-objects.service';

const mockPolygon: SportPolygon = {
  geometry: [],
  name: 'test-name',
  analytics: {
    areasSquare: 123,
    areasSquarePer100k: 123,
    areasAmount: 123,
    areasAmountPer100k: 123,
    sportsAmount: 123,
    sportsAmountPer100k: 123,
    sportKinds: ['first-kind', 'second-kind', 'third-kind'],
    areaTypes: ['first-area', 'second-area', 'third-area'],
    areaTypesAmount: 123,
  },
  areas: [
    {
      objectId: 124324,
      objectName: 'gkdsjglkjfsg',
      sportAreaAddress: 'fslkdjgksjg',
      objectPoint: { lat: 2, lng: 2 },
      departmentalOrganizationId: 124324,
      departmentalOrganizationName: 'gfjdjgdkfg',
      sportsAreaId: 43234,
      sportsAreaName: 'first-area-element',
      sportsAreaType: 'first-area',
      sportsAreaSquare: 34324,
      availability: 1,
      sportKind: 'first-kind',
    },
    {
      objectId: 124324,
      objectName: 'gkdsjglkjfsg',
      sportAreaAddress: 'fslkdjgksjg',
      objectPoint: { lat: 2, lng: 2 },
      departmentalOrganizationId: 124324,
      departmentalOrganizationName: 'gfjdjgdkfg',
      sportsAreaId: 43234,
      sportsAreaName: 'second-area-element',
      sportsAreaType: 'second-area',
      sportsAreaSquare: 34324,
      availability: 1,
      sportKind: 'second-kind',
    },
    {
      objectId: 124324,
      objectName: 'gkdsjglkjfsg',
      sportAreaAddress: 'fslkdjgksjg',
      objectPoint: { lat: 2, lng: 2 },
      departmentalOrganizationId: 124324,
      departmentalOrganizationName: 'gfjdjgdkfg',
      sportsAreaId: 43234,
      sportsAreaName: 'third-area-element',
      sportsAreaType: 'third-area',
      sportsAreaSquare: 34324,
      availability: 1,
      sportKind: 'third-kind',
    },
  ],
};

@Component({
  selector: 'tp-saved-sport-polygon',
  templateUrl: './saved-sport-polygon.component.html',
  styleUrls: ['./saved-sport-polygon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedSportPolygonComponent {

  constructor(
    public readonly sportObjectUtils: SportObjectsService,
  ) { }

  @Input()
  public set polygon(value: SportPolygon) {
    this.polygonSubject.next(value);
  }

  public readonly polygonSubject =
  new BehaviorSubject<SportPolygon | undefined>(mockPolygon);

  public readonly areaTypes = this.polygonSubject.pipe(
    filter(isNotNil),
    map(({ areas }) => this.sportObjectUtils.getAreaTypes(areas)),
  );

  public readonly sportKinds = this.polygonSubject.pipe(
    filter(isNotNil),
    map(({ areas }) => this.sportObjectUtils.getSportKinds(areas)),
  );


  // #region Opened

  public readonly isOpened = new BehaviorSubject<boolean>(false);

  public readonly isAreaTypesOpened = new BehaviorSubject<boolean>(false);

  public readonly isSportKindsOpened = new BehaviorSubject<boolean>(false);

  // #endregion

}
