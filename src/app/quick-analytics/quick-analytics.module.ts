import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { QuickAnalyticsControlsComponent } from './components/quick-analytics-controls/quick-analytics-controls.component';


@NgModule({
  declarations: [
    QuickAnalyticsControlsComponent,
  ],
  exports: [
    QuickAnalyticsControlsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class QuickAnalyticsModule { }
