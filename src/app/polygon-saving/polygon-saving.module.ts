import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { SavedPolygonComponent } from './components/saved-polygon/saved-polygon.component';
import { PolygonSavingSettingsComponent } from './components/polygon-saving-settings/polygon-saving-settings.component';


@NgModule({
  declarations: [
    SavedPolygonComponent,
    PolygonSavingSettingsComponent,
  ],
  exports: [
    PolygonSavingSettingsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class PolygonSavingModule { }
