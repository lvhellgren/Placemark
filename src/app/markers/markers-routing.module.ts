import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarkersComponent } from './markers.component';

const routes: Routes = [{ path: '', component: MarkersComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarkersRoutingModule { }
