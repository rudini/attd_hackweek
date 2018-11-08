import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeuerungsrechnerComponent } from './page/teuerungsrechner.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TeuerungsrechnerEffect } from './+state/effect';
import { teuerungsrechnerReducer } from './+state/reducer';
import { TeuerungsrechnerPageComponent } from './page/teuerungsrechner.page';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxFpTsModule } from 'ngx-fp-ts';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxFpTsModule,
    HttpClientModule,
    EffectsModule.forFeature([TeuerungsrechnerEffect]),
    StoreModule.forFeature('teuerungsrechner', teuerungsrechnerReducer),
  ],
  declarations: [TeuerungsrechnerComponent, TeuerungsrechnerPageComponent]
})
export class TeuerungsrechnerModule { }
