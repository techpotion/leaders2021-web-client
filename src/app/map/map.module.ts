import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { SharedModule } from '../shared/shared.module';

import { MapComponent } from './components/map/map.component';
import { MapPageComponent } from './components/map-page/map-page.component';
import { MapToggleComponent } from './components/map-toggle/map-toggle.component';

import { ComponentRenderService } from '../shared/services/component-render.service';
import { MapFilterBarComponent } from './components/map-filter-bar/map-filter-bar.component';


@NgModule({
  declarations: [
    MapComponent,
    MapPageComponent,
    MapToggleComponent,
    MapFilterBarComponent,
  ],
  exports: [
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    SharedModule,
  ],
  providers: [
    ComponentRenderService,
  ],
})
export class MapModule { }
