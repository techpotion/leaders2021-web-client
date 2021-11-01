import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, Subscription } from 'rxjs';

import { SportPolygonService } from '../../services/sport-polygon.service';

import { SportPolygon } from '../../models/sport-polygon';


@Component({
  selector: 'tp-new-polygon-settings-chapter',
  templateUrl: './new-polygon-settings-chapter.component.html',
  styleUrls: ['./new-polygon-settings-chapter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPolygonSettingsChapterComponent implements AfterViewInit {

  constructor(
    public readonly polygonStorage: SportPolygonService,
  ) { }


  // #region Life cycle hooks

  public ngAfterViewInit(): void {
    this.nameInput.nativeElement.focus();
  }

  // #endregion


  // #region Name input

  public readonly nameControl = new FormControl('');

  @ViewChild('nameInput')
  public nameInput!: ElementRef<HTMLInputElement>;

  // #endregion


  // #region Selecting polygon

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
        this.nameControl.disable();
      }
    });
  }

  // #endregion


  // #region Saving polygon

  public saveNewPolygon(): void {
    if (!this.newPolygonSubject.value) {
      throw new Error('Cannot save polygon: '
        + 'no polygon selected.');
    }
    this.polygonStorage.savePolygon(this.newPolygonSubject.value);
    this.clearNewModeValues();
  }

  // #endregion


  // #region Clearing polygon

  private clearNewModeValues(): void {
    this.nameControl.reset();
    this.selectPolygon.next(null);
    this.newPolygonSubject.next(null);
    this.nameControl.enable();
  }

  public clearNewPolygon(): void {
    this.newPolygonSubject.next(null);
    this.selectPolygon.next(this.nameControl.value);
  }

  // #endregion

}
