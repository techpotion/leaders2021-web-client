import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tp-completion-input',
  templateUrl: './completion-input.component.html',
  styleUrls: ['./completion-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompletionInputComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
