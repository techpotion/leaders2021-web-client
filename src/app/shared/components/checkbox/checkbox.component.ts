import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'tp-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {

  constructor() { }

  @HostBinding('class.checked')
  @Input()
  public value = false;

  @Output()
  public readonly valueChange = new EventEmitter<boolean>();

  @HostListener('click')
  public onClick(): void {
    this.value = !this.value;
    this.valueChange.emit(this.value);
  }

}
