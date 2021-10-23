import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SportObjectsModule } from '../sport-objects/sport-objects.module';

import { MapComponent } from './components/map/map.component';
import { MapPageComponent } from './components/map-page/map-page.component';
import { MapToggleComponent } from './components/map-toggle/map-toggle.component';

import { ComponentRenderService } from '../shared/services/component-render.service';
import { PolygonSavingSettingsComponent } from './components/polygon-saving-settings/polygon-saving-settings.component';
import { SavedPolygonComponent } from './components/saved-polygon/saved-polygon.component';


@NgModule({
  declarations: [
    MapComponent,
    MapPageComponent,
    MapToggleComponent,
    PolygonSavingSettingsComponent,
    SavedPolygonComponent,
  ],
  exports: [
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    SharedModule,
    SportObjectsModule,
  ],
  providers: [
    ComponentRenderService,
  ],
})
export class MapModule { }
