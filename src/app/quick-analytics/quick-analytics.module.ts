import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';

import { QuickAnalyticsControlsComponent } from './components/quick-analytics-controls/quick-analytics-controls.component';
import { QuickAnalyticsInfoComponent } from './components/quick-analytics-info/quick-analytics-info.component';


@NgModule({
  declarations: [
    QuickAnalyticsControlsComponent,
    QuickAnalyticsInfoComponent,
  ],
  exports: [
    QuickAnalyticsControlsComponent,
    QuickAnalyticsInfoComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class QuickAnalyticsModule { }
