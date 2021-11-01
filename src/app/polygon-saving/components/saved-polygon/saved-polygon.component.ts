import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import { SportPolygon } from '../../models/sport-polygon';

import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { isNotNil } from '../../../shared/utils/is-not-nil';
import { createSizeIncreaseAnimation } from '../../../shared/utils/create-size-increase-animation';
import { SportObjectsService } from '../../../sport-objects/services/sport-objects.service';


@Component({
  selector: 'tp-saved-polygon',
  templateUrl: './saved-polygon.component.html',
  styleUrls: ['./saved-polygon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    createSizeIncreaseAnimation('height'),
  ],
})
export class SavedPolygonComponent {

  constructor(
    public readonly sportObjectUtils: SportObjectsService,
  ) { }

  @Input()
  public set polygon(value: SportPolygon) {
    this.polygonSubject.next(value);
  }

  public readonly polygonSubject =
  new BehaviorSubject<SportPolygon | undefined>(undefined);

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
