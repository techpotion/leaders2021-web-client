import { Injectable } from '@angular/core';

import _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';


interface MapLoadingObject {
  analytics: boolean;
  data: boolean;
  download: boolean;
  heatmap: boolean;
  map: boolean;
  marker: boolean;
}

type MapLoadingKey = keyof MapLoadingObject;

const IS_SHOWN_DEBOUNCE_TIME = 300;

@Injectable()
export class MapLoadingService {

  constructor() { }

  /**
   * Loading state.
   */
  private readonly loadingObject = new BehaviorSubject<MapLoadingObject>({
    analytics: false,
    data: false,
    download: false,
    heatmap: false,
    map: false,
    marker: false,
  });

  /**
   * Readonly loading state.
   */
  public readonly loadingObservable = this.loadingObject.asObservable();

  /**
   * Flag that is true if any loading key is true.
   */
  public readonly isShown = this.loadingObject.pipe(
    map(obj => _.some(Object.values(obj))),
    debounceTime(IS_SHOWN_DEBOUNCE_TIME),
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
