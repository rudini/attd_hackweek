import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxFpTsModule } from 'ngx-fp-ts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import localeDECH from '@angular/common/locales/de-CH';
import { registerLocaleData } from "@angular/common";
import { ReactiveFormsModule } from '@angular/forms';
registerLocaleData(localeDECH);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxFpTsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
