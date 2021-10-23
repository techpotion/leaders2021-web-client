import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SportObjectsRoutingModule } from './sport-objects-routing.module';
import { SharedModule } from '../shared/shared.module';

import { SportObjectBriefInfoComponent } from './components/sport-object-brief-info/sport-object-brief-info.component';
import { SportObjectFilterBarComponent } from './components/sport-object-filter-bar/sport-object-filter-bar.component';
import { SportObjectFullInfoComponent } from './components/sport-object-full-info/sport-object-full-info.component';
import { SportAreaBriefInfoComponent } from './components/sport-area-brief-info/sport-area-brief-info.component';
import { SportPolygonSavingSettingsComponent } from './components/sport-polygon-saving-settings/sport-polygon-saving-settings.component';
import { SavedSportPolygonComponent } from './components/saved-sport-polygon/saved-sport-polygon.component';
import { AreaPipe } from './pipes/area.pipe';


@NgModule({
  declarations: [
    SportObjectBriefInfoComponent,
    SportObjectFilterBarComponent,
    SportObjectFullInfoComponent,
    SportAreaBriefInfoComponent,
    SportPolygonSavingSettingsComponent,
    SavedSportPolygonComponent,
    AreaPipe,
  ],
  exports: [
    SportObjectFilterBarComponent,
    SportObjectFullInfoComponent,
    SportAreaBriefInfoComponent,
    SportPolygonSavingSettingsComponent,
  ],
  imports: [
    CommonModule,
    SportObjectsRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class SportObjectsModule { }
