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

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IconSet } from './template-icon-store.service';

@Injectable({
  providedIn: 'root'
})
export class CustomIconStoreService {
  private static storeTag = 'icon-store/';
  private static setStoreTag = CustomIconStoreService.storeTag + 'sets:';
  private static iconStoreTag = CustomIconStoreService.storeTag + 'icons:';

  private setStore: Map<string, string[]> = new Map();
  private iconStore: Map<string, string> = new Map();

  // Informs observers that icon sets are available
  private iconSetNamesFetched = new BehaviorSubject<string[]>([]);
  public iconSetNamesFetched$ = this.iconSetNamesFetched.asObservable();

  // Informs observers that icon sets and icons are available
  private iconSetsFetched = new BehaviorSubject<IconSet[]>([]);
  public iconSetsFetched$ = this.iconSetsFetched.asObservable();

  // Informs observers that an icon set is available
  private iconSetFetched = new BehaviorSubject<string[]>([]);
  public iconSetFetched$ = this.iconSetFetched.asObservable();

  constructor() {
    // localStorage.removeItem(CustomIconStoreService.setStoreTag);
    // localStorage.removeItem(CustomIconStoreService.iconStoreTag);
    this.loadStores();
  }

  private static makeIconKey(set: string, name: string): string {
    return `${set}/${name}`;
  }

  public loadStores(): void {
    this.setStore.clear();
    this.iconStore.clear();

    Object.keys(localStorage).forEach((localStorageItem) => {
      if (localStorageItem.startsWith(CustomIconStoreService.setStoreTag)) {
        const sets = JSON.parse(localStorage.getItem(localStorageItem));
        sets.forEach((set: any[]) => {
          this.setStore.set(set[0], set[1]);
        });
      } else if (localStorageItem.startsWith(CustomIconStoreService.iconStoreTag)) {
        const icons = JSON.parse(localStorage.getItem(localStorageItem));
        const set: string[] = [];
        icons.forEach((item) => {
          this.iconStore.set(item[0], item[1]);
        });
      }
    });
    this.fetchSetNames();
  }

  public fetchSetNames(): void {
    this.iconSetNamesFetched.next(Array.from(this.setStore.keys()));
  }

  public fetchSets(): void {
    const iconSets: IconSet[] = [];
    Array.from(this.setStore.keys()).forEach(setName => {
      const collection = [];
      this.setStore.get(setName).forEach((iconName) => {
        collection.push({name: iconName, id: iconName});
      });
      iconSets.push({name: setName, collection, setId: setName});
    });

    this.iconSetsFetched.next(iconSets);
  }

  public fetchSet(iconSet: string): void {
    this.iconSetFetched.next(this.setStore.get(iconSet));
  }

  public storeIcon(iconSet: string, iconName: string, svg: string, responseHandler = (success: boolean) => {}): void {
    const set: string[] = this.setStore.get(iconSet);
    if (!!!set) {
      this.setStore.set(iconSet, [iconName]);
    } else if (!set.includes(iconName)) {
      set.push(iconName);
    }

    if (!!this.iconStore.set(CustomIconStoreService.makeIconKey(iconSet, iconName), svg)) {
      this.recreateStorage();
      responseHandler(true);
    } else {
      responseHandler(false);
    }
  }

  public loadIcon(iconSet: string, iconName: string, responseHandler = (svg) => {}): void {
    const icon = this.iconStore.get(CustomIconStoreService.makeIconKey(iconSet, iconName));
    responseHandler(icon);
  }

  public deleteIcon(iconSet: string, iconName: string,  responseHandler = (svg) => {}): void {
    const newSets = this.setStore.get(iconSet).filter(item => item !== iconName);
    if (newSets.length > 0) {
      this.setStore.set(iconSet, newSets);
    } else {
      this.setStore.delete(iconSet);
    }
    if (this.iconStore.delete(CustomIconStoreService.makeIconKey(iconSet, iconName))) {
      this.recreateStorage();
      responseHandler(true);
    } else {
      responseHandler(false);
    }
  }

  private recreateStorage(): void {
    const sets = Array.from(this.setStore.entries());
    localStorage.removeItem(CustomIconStoreService.setStoreTag);
    localStorage.setItem(CustomIconStoreService.setStoreTag, JSON.stringify(sets));

    const icons = Array.from(this.iconStore.entries());
    localStorage.removeItem(CustomIconStoreService.iconStoreTag);
    localStorage.setItem(CustomIconStoreService.iconStoreTag, JSON.stringify(icons));

    this.loadStores();
  }
}
