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

export class ElementStyling {
  private styleMap: Map<string, string>;

  /**
   * Manages SVG element style attributes.
   * @param style HTML style attribute in string format
   */
  constructor(style: string) {
    this.styleMap = new Map<string, string>();
    style = style.replace(/[\n\r ]/g, '');
    const nameValues = style.split(';');
    nameValues.forEach(item => {
      const nameValue = item.split(':');
      this.styleMap.set(nameValue[0], nameValue[1]);
    });
  }

  public setStyleItem(key: string, value: string): void {
    this.styleMap.set(key, value);
  }

  public getStyleMap(): Map<string, string> {
    return this.styleMap;
  }

  /**
   * @return a formatted HTML style attribute string
   */
  public getStyle(): string {
    let style = '';
    this.styleMap.forEach((value, key) => {
      if (!!key && !!value) {
        style += `${key}: ${value};`;
      }
    });
    return style;
  }
}
