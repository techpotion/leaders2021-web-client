import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'tp-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPageComponent {

  constructor() { }

  public readonly loadingSubject = new BehaviorSubject<boolean>(false);

}
