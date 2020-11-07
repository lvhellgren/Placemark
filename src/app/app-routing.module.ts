import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'icons',
    loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule)
  },
  { path: 'markers',
    loadChildren: () => import('./markers/markers.module').then(m => m.MarkersModule)
  }
  ];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(
      routes,
      {
        // Load lazy modules in the background
        // preloadingStrategy: PreloadAllModules
      })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
