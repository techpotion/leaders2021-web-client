import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SportObjectsRoutingModule } from './sport-objects-routing.module';
import { SharedModule } from '../shared/shared.module';

import { SportObjectBriefInfoComponent } from './components/sport-object-brief-info/sport-object-brief-info.component';
import { SportObjectFilterBarComponent } from './components/sport-object-filter-bar/sport-object-filter-bar.component';
import { SportObjectFullInfoComponent } from './components/sport-object-full-info/sport-object-full-info.component';
import { SportAreaBriefInfoComponent } from './components/sport-area-brief-info/sport-area-brief-info.component';
import { SportAreaDashboardComponent } from './components/sport-area-dashboard/sport-area-dashboard.component';
import { DashboardAreasChapterComponent } from './components/dashboard-areas-chapter/dashboard-areas-chapter.component';
import { DashboardAreaTypesChapterComponent } from './components/dashboard-area-types-chapter/dashboard-area-types-chapter.component';
import { DashboardAnalyticsChapterComponent } from './components/dashboard-analytics-chapter/dashboard-analytics-chapter.component';
import { DensityInfoComponent } from './components/density-info/density-info.component';


@NgModule({
  declarations: [
    SportObjectBriefInfoComponent,
    SportObjectFilterBarComponent,
    SportObjectFullInfoComponent,
    SportAreaBriefInfoComponent,
    SportAreaDashboardComponent,
    DashboardAreasChapterComponent,
    DashboardAreaTypesChapterComponent,
    DashboardAnalyticsChapterComponent,
    DensityInfoComponent,
  ],
  exports: [
    SportObjectFilterBarComponent,
    SportObjectFullInfoComponent,
    SportAreaBriefInfoComponent,
    SportAreaDashboardComponent,
    DensityInfoComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    SharedModule,
    SportObjectsRoutingModule,
  ],
})
export class SportObjectsModule { }
