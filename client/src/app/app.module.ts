import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { NgxFpTsModule } from 'ngx-fp-ts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import localeDECH from '@angular/common/locales/de-CH';
import { registerLocaleData } from "@angular/common";
import { ReactiveFormsModule } from '@angular/forms';
import { TeuerungsrechnerModule } from '@teuerungsrechner/teuerungsrechner.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, MetaReducer } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import {storeLogger } from 'ngrx-store-logger';
registerLocaleData(localeDECH);

export const metaReducers: MetaReducer<any>[] = [
  ...(environment.ngrxStoreLoggerEnabled ? [storeLogger()] : []),
  ...(environment.ngrxStoreFreezeEnabled ? [] : []),
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxFpTsModule,
    ReactiveFormsModule,
    EffectsModule.forRoot([]),
    StoreModule.forRoot({}, {metaReducers}),
    TeuerungsrechnerModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de-CH' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
