import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExelorMarkerComponent } from './exelor-marker.component';
import { ExelorMarkerRoutingModule } from './exelor-marker-routing.module';



@NgModule({
  declarations: [ExelorMarkerComponent],
  imports: [
    CommonModule,
    ExelorMarkerRoutingModule
  ]
})
export class ExelorMarkerModule { }
