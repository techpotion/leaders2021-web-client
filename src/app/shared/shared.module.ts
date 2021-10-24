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
import { DashboardPieChartComponent } from './components/dashboard-pie-chart/dashboard-pie-chart.component';
import { DashboardChipListComponent } from './components/dashboard-chip-list/dashboard-chip-list.component';

import { AreaPipe } from './pipes/area.pipe';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    MultipleSelectComponent,
    CheckboxComponent,
    CompletionInputComponent,
    RadiobuttonComponent,
    PieChartComponent,
    SearchInputComponent,
    DashboardPieChartComponent,
    DashboardChipListComponent,
    AreaPipe,
  ],
  exports: [
    LoadingSpinnerComponent,
    MultipleSelectComponent,
    CompletionInputComponent,
    RadiobuttonComponent,
    SearchInputComponent,
    DashboardPieChartComponent,
    DashboardChipListComponent,
    AreaPipe,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule { }
