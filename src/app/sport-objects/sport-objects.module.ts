import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SportObjectsRoutingModule } from './sport-objects-routing.module';
import { SharedModule } from '../shared/shared.module';

import { SportObjectBriefInfoComponent } from './components/sport-object-brief-info/sport-object-brief-info.component';
import { SportObjectFilterBarComponent } from './components/sport-object-filter-bar/sport-object-filter-bar.component';
import { SportObjectFullInfoComponent } from './components/sport-object-full-info/sport-object-full-info.component';


@NgModule({
  declarations: [
    SportObjectBriefInfoComponent,
    SportObjectFilterBarComponent,
    SportObjectFullInfoComponent,
  ],
  exports: [
    SportObjectFilterBarComponent,
    SportObjectFullInfoComponent,
  ],
  imports: [
    CommonModule,
    SportObjectsRoutingModule,
    SharedModule,
  ],
})
export class SportObjectsModule { }
