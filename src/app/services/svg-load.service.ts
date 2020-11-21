// Copyright (c) 2020 Lars Hellgren (lars@exelor.com).
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

import { Subject } from 'rxjs';
import { SubSink } from 'subsink';
import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDlgComponent } from '../error-dlg/error-dlg.component';

export interface SvgWrapper {
  iconSetId: string;
  iconId: string;
  svg: string;
}

@Injectable({

  providedIn: 'root'
})
export class SvgLoadService implements OnDestroy {
  private static readonly iconDir = '/assets/';

  // Informs observers that an SVG document has been loaded
  private svgLoaded = new Subject<SvgWrapper>();
  public svgLoaded$ = this.svgLoaded.asObservable();

  private subSink = new SubSink();

  constructor(private dialog: MatDialog) {
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * Loads SVG icons fro a server directory
   */
  public load(iconSetId: string, iconId: string): void {
    const xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.open('GET', `${SvgLoadService.iconDir}/${iconSetId}/${iconId}.svg`, true);
    xmlHttpRequest.onload = () => {
      const response = xmlHttpRequest.response;
      if (!!response) {
        const svgWrapper: SvgWrapper = {
          iconSetId,
          iconId,
          svg: response
        };
        this.svgLoaded.next(response);
      } else {
        this.dialog.open(ErrorDlgComponent, {
          data: {
            msg: `Could not load ${SvgLoadService.iconDir}/${iconSetId}/${iconId}.svg`
          }
        });
      }
    };
  }
}
