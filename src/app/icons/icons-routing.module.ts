import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IconsComponent } from './icons.component';

const routes: Routes = [
    { path: '',
      component: IconsComponent,
      children: [
        { path: 'exelor-marker',
          loadChildren: () => import('./exelor-marker/exelor-marker.module').then(m => m.ExelorMarkerModule)
        },
        { path: 'exelor-overlay',
          loadChildren: () => import('./exelor-overlay/exelor-overlay.module').then(m => m.ExelorOverlayModule)
        },
        { path: 'font-awesome',
          loadChildren: () => import('./font-awesome/font-awesome.module').then(m => m.FontAwesomeModule)
        }
      ]
    }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IconsRoutingModule { }
