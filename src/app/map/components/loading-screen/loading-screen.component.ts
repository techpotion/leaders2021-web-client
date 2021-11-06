import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

import { filter, map } from 'rxjs/operators';

import { MapLoadingService } from '../../services/map-loading.service';


@Component({
  selector: 'tp-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingScreenComponent {

  constructor(
    public readonly cd: ChangeDetectorRef,
    private readonly service: MapLoadingService,
  ) { }

  public readonly objectName = this.service.loadingObservable.pipe(
    filter(obj => obj.map
      || obj.marker
      || obj.heatmap
      || obj.analytics
      || obj.data
      || obj.download,
    ),
    map(obj => {
      if (obj.map) { return 'карту'; }
      if (obj.marker) { return 'маркеры'; }
      if (obj.heatmap) { return 'тепловую карту'; }
      if (obj.analytics) { return 'аналитику'; }
      if (obj.data) { return 'данные'; }
      if (obj.download) { return 'файл'; }
      return null;
    }),
  );

}
