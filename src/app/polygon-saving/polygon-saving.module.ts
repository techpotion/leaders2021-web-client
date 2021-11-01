import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { SavedPolygonComponent } from './components/saved-polygon/saved-polygon.component';
import { PolygonSavingSettingsComponent } from './components/polygon-saving-settings/polygon-saving-settings.component';
import { NewPolygonSettingsChapterComponent } from './components/new-polygon-settings-chapter/new-polygon-settings-chapter.component';
import { ExistingPolygonSettingsChapterComponent } from './components/existing-polygon-settings-chapter/existing-polygon-settings-chapter.component';


@NgModule({
  declarations: [
    SavedPolygonComponent,
    PolygonSavingSettingsComponent,
    NewPolygonSettingsChapterComponent,
    ExistingPolygonSettingsChapterComponent,
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
