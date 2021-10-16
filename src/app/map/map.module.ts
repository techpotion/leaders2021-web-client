import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapRoutingModule } from './map-routing.module';
import { SharedModule } from '../shared/shared.module';

import { MapComponent } from './components/map/map.component';
import { MapPageComponent } from './components/map-page/map-page.component';
import { MapToggleComponent } from './components/map-toggle/map-toggle.component';


@NgModule({
  declarations: [
    MapComponent,
    MapPageComponent,
    MapToggleComponent,
  ],
  exports: [
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    SharedModule,
  ],
})
export class MapModule { }
