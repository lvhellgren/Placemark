import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeComponent } from './font-awesome.component';
import { FontAwesomeRoutingModule } from './font-awesome-routing.module';



@NgModule({
  declarations: [FontAwesomeComponent],
  imports: [
    CommonModule,
    FontAwesomeRoutingModule
  ]
})
export class FontAwesomeModule { }
