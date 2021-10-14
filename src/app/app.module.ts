import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MapModule } from './map/map.module';

import { interceptorProviders } from './core/interceptors/interceptor-providers';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    MapModule,
  ],
  providers: [
    interceptorProviders,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
