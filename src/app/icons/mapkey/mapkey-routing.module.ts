import { NgModule } from '@angular/core';
import { MapkeyComponent } from './mapkey.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  { path: '', component: MapkeyComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapkeyRoutingModule { }
