import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';


@Component({
  selector: 'tp-map-toggle',
  templateUrl: './map-toggle.component.html',
  styleUrls: ['./map-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapToggleComponent implements OnInit {

  constructor() { }

  public ngOnInit(): void {
    if (!this.lightIcon || !this.darkIcon) {
      throw new Error('Cannot initialize toggle: '
        + 'icon required');
    }
  }

  @Input()
  public lightIcon?: string;

  @Input()
  public darkIcon?: string;

  @HostBinding('class.disabled')
  @Input()
  public disabled = false;

  @HostBinding('class.toggle-icon-button')
  public readonly toggleIconButtoClass = true;

  // #region Pressed state

  @HostListener('click')
  public onClick(): void {
    if (this.disabled) { return; }
    this.isPressed = !this.isPressed;
    this.pressChange.emit(this.isPressed);
  }

  @HostBinding('class.pressed')
  @Input()
  public isPressed = false;

  @Output()
  public readonly pressChange = new EventEmitter<boolean>();

  // #endregion

}
