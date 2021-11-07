import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SportObjectsModule } from '../sport-objects/sport-objects.module';
import { PolygonSavingModule } from '../polygon-saving/polygon-saving.module';
import { QuickAnalyticsModule } from '../quick-analytics/quick-analytics.module';

import { MapComponent } from './components/map/map.component';
import { MapPageComponent } from './components/map-page/map-page.component';
import { MapToggleComponent } from './components/map-toggle/map-toggle.component';

import { ComponentRenderService } from '../shared/services/component-render.service';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';


@NgModule({
  declarations: [
    MapComponent,
    MapPageComponent,
    MapToggleComponent,
    LoadingScreenComponent,
  ],
  exports: [
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    PolygonSavingModule,
    SharedModule,
    SportObjectsModule,
    QuickAnalyticsModule,
  ],
  providers: [
    ComponentRenderService,
  ],
})
export class MapModule { }
