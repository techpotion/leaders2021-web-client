import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { MultipleSelectComponent } from './components/multiple-select/multiple-select.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';


@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    MultipleSelectComponent,
    CheckboxComponent,
  ],
  exports: [
    LoadingSpinnerComponent,
    MultipleSelectComponent,
  ],
  imports: [
    CommonModule,
  ],
})
export class SharedModule { }
