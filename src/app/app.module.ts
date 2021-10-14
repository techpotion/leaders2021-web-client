import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MapModule } from './map/map.module';

import { interceptorProviders } from './core/interceptors/interceptor-providers';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MapModule,
  ],
  providers: [
    interceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
