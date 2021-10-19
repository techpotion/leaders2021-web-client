import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SportObjectsRoutingModule } from './sport-objects-routing.module';
import { SportObjectBriefInfoComponent } from './components/sport-object-brief-info/sport-object-brief-info.component';


@NgModule({
  declarations: [
    SportObjectBriefInfoComponent
  ],
  imports: [
    CommonModule,
    SportObjectsRoutingModule,
  ],
})
export class SportObjectsModule { }
