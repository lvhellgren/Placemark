// Copyright (c) 2021 Lars Hellgren (lars@exelor.com).
// All rights reserved.
//
// This code is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IconComponent } from './icon.component';

const routes: Routes = [
  {
    path: '',
    component: IconComponent,
    children: [
      {
        path: 'path-element',
        loadChildren: () => import('./style-editors/path-element/path-element.module').then(m => m.PathElementModule)
      },
      {
        path: 'text-element',
        loadChildren: () => import('./style-editors/text-element/text-element.module').then(m => m.TextElementModule)
      },
      {
        path: 'exelor-image',
        loadChildren: () => import('./style-editors/exelor-image/exelor-image.module').then(m => m.ExelorImageModule)
      },
      {
        path: 'font-awesome',
        loadChildren: () => import('./style-editors/font-awesome/font-awesome.module').then(m => m.FontAwesomeModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IconRoutingModule {
}
