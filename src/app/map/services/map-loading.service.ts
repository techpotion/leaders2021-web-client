import { Injectable } from '@angular/core';

import _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';


interface MapLoadingObject {
  heatmap: boolean;
  marker: boolean;
}

type MapLoadingKey = keyof MapLoadingObject;

@Injectable()
export class MapLoadingService {

  constructor() { }

  /**
   * Loading state.
   */
  private readonly loadingObject = new BehaviorSubject<MapLoadingObject>({
    heatmap: false,
    marker: false,
  });

  /**
   * Flag that is true if any loading key is true.
   */
  public readonly isShown = this.loadingObject.pipe(
    map(obj => _.some(Object.values(obj))),
  );

  /**
   * Changes value of loading key.
   *
   * @param key Loading key
   * @param value Key value to set
   */
  public toggle(key: MapLoadingKey, value: boolean): void {
    if (this.loadingObject.value[key] === value) { return; }

    const updatableObject = { ...this.loadingObject.value };
    updatableObject[key] = value;
    this.loadingObject.next(updatableObject);
  }

}
