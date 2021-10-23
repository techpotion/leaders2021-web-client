import {
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  HostListener,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';


@Component({
  selector: 'tp-radiobutton',
  templateUrl: './radiobutton.component.html',
  styleUrls: ['./radiobutton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadiobuttonComponent {

  constructor() { }

  @HostBinding('class.enabled')
  @Input()
  public enabled = false;

  @Output()
  public readonly enabledChange = new EventEmitter<boolean>();

  @HostListener('click')
  public onClick(): void {
    this.enabled = !this.enabled;
    this.enabledChange.next(this.enabled);
  }

}
