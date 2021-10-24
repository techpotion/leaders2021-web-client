import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { MultipleSelectComponent } from './components/multiple-select/multiple-select.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { CompletionInputComponent } from './components/completion-input/completion-input.component';
import { RadiobuttonComponent } from './components/radiobutton/radiobutton.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { SearchInputComponent } from './components/search-input/search-input.component';


@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    MultipleSelectComponent,
    CheckboxComponent,
    CompletionInputComponent,
    RadiobuttonComponent,
    PieChartComponent,
    SearchInputComponent,
  ],
  exports: [
    LoadingSpinnerComponent,
    MultipleSelectComponent,
    CompletionInputComponent,
    RadiobuttonComponent,
    PieChartComponent,
    SearchInputComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule { }
