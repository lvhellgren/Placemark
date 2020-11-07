import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExelorMarkerComponent } from './exelor-marker.component';


const routes: Routes = [
  { path: '', component: ExelorMarkerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExelorMarkerRoutingModule { }
