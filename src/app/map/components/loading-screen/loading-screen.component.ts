import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tp-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingScreenComponent {

  constructor() { }

}
