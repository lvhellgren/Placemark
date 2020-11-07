import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExelorOverlayComponent } from './exelor-overlay.component';


const routes: Routes = [
  { path: '', component: ExelorOverlayComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExelorOverlayRoutingModule { }
