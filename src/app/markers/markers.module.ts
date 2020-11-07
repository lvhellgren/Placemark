import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarkersRoutingModule } from './markers-routing.module';
import { MarkersComponent } from './markers.component';


@NgModule({
  declarations: [MarkersComponent],
  imports: [
    CommonModule,
    MarkersRoutingModule
  ]
})
export class MarkersModule { }
