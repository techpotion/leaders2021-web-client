import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { MultipleSelectComponent } from './components/multiple-select/multiple-select.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { CompletionInputComponent } from './components/completion-input/completion-input.component';


@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    MultipleSelectComponent,
    CheckboxComponent,
    CompletionInputComponent,
  ],
  exports: [
    LoadingSpinnerComponent,
    MultipleSelectComponent,
    CompletionInputComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule { }
