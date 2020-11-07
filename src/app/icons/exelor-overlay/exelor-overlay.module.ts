import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExelorOverlayComponent } from './exelor-overlay.component';
import { ExelorOverlayRoutingModule } from './exelor-overlay-routing.module';



@NgModule({
  declarations: [ExelorOverlayComponent],
  imports: [
    CommonModule,
    ExelorOverlayRoutingModule
  ]
})
export class ExelorOverlayModule { }
