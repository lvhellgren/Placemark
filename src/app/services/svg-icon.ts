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


export class SvgIcon {
  private static DEFAULT_SCALE = 1.0;

  private isModified = false;

  private readonly svgDocument: Document;
  private readonly svgElements: HTMLCollectionOf<SVGElementTagNameMap['svg']>;
  private readonly svgElement: SVGElementTagNameMap['svg'];
  private readonly pathElements: HTMLCollectionOf<SVGPathElement>;
  private readonly circleElements: HTMLCollectionOf<SVGCircleElement>;
  private readonly textElement: SVGTextElement;
  private readonly faSymbolElement: SVGElement;
  private readonly imageElement: SVGImageElement;

  private readonly markerType: string;
  private readonly initialWidth: number;
  private readonly initialHeight: number;
  private readonly initialScale: number;
  private adjustedWidth: number;
  private readonly origin: string;
  private readonly iconType: string;
  private pathScaleStart: number;
  private pathScaleIncr: number;
  private textLengthStart: number;

  private textContent: string;
  private scale: number;
  private currentWidth: number;
  private currentHeight: number;

  private styleElement: HTMLStyleElement;

  constructor(public svgText: string) {
    try {
      this.svgDocument = (new DOMParser()).parseFromString(svgText, 'image/svg+xml');
      this.svgElements = this.svgDocument.getElementsByTagName('svg');
      this.svgElement = this.svgElements[0];

      this.markerType = this.svgElement.getAttribute('data-markerType');
      this.markerType = !!this.markerType ? this.markerType : 'marker';

      this.initialWidth = +this.svgElement.getAttribute('data-initial-width');
      if (!!!this.initialWidth) {
        this.initialWidth = +this.svgElement.getAttribute('width');
        this.svgElement.setAttribute('data-initial-width', this.initialWidth.toString());
      }
      this.adjustedWidth = this.initialWidth;

      this.initialHeight = +this.svgElement.getAttribute('data-initial-height');
      if (!!!this.initialHeight) {
        this.initialHeight = +this.svgElement.getAttribute('height');
        this.svgElement.setAttribute('data-initial-height', this.initialHeight.toString());
      }

      this.initialScale = +this.svgElement.getAttribute('data-initial-scale');
      if (!!!this.initialScale) {
        this.initialScale = SvgIcon.DEFAULT_SCALE;
      }

      this.scale = +this.svgElement.getAttribute('data-scale');
      if (!!!this.scale) {
        this.scale = this.initialScale;
        this.svgElement.setAttribute('data-scale', this.scale.toString());
      }

      if (this.scale !== SvgIcon.DEFAULT_SCALE) {
        this.applyScale(this.scale);
      }

      this.pathElements = this.svgDocument.getElementsByTagName('path');
      this.circleElements = this.svgDocument.getElementsByTagName('circle');

      this.origin = this.svgElement.getAttribute('data-origin');
      if (!!this.origin && this.origin === 'exelor') {
        this.iconType = this.svgElement.getAttribute('data-icon-type');
        if (!!this.iconType && this.iconType === 'text-box') {
          this.pathScaleStart = +this.svgElement.getAttribute('data-path-scale-start');
          this.pathScaleIncr = +this.svgElement.getAttribute('data-path-scale-incr');
          this.textLengthStart = +this.svgElement.getAttribute('data-text-length-start');
        }
      }

      const styleElements: HTMLCollectionOf<HTMLStyleElement> = this.svgDocument.getElementsByTagName('style');
      if (styleElements.length > 0) {
        this.styleElement = styleElements[0];
      }
    } catch (e) {
      console.error(e.toString());
      throw Error(`Failed loading SVG document: ${e.toString()}`);
    }

    if (this.origin === 'exelor') {
      try {
        const textElements: HTMLCollectionOf<SVGTextElement> = this.svgDocument.getElementsByTagName('text');
        if (textElements.length > 0) {
          this.textElement = textElements[0];
          this.textContent = this.textElement.textContent;

          if (this.iconType === 'text-box') {
            this.formatTextBox(this.textContent.length);
            this.applyScale(this.scale);
          }
        }

        const imageElements: HTMLCollectionOf<SVGImageElement> = this.svgDocument.getElementsByTagName('image');
        if (imageElements.length > 0) {
          this.imageElement = imageElements[0];
        }
      } catch (e) {
        console.error(e.toString());
        throw Error(`Failed loading SVG element: ${e.toString()}`);
      }
    } else if (this.origin === 'awesome' || this.svgElements[1]) {
      try {
        this.faSymbolElement = this.svgElements[1];
      } catch (e) {
        console.error(e.toString());
        throw Error(`Failed loading Font Awesome element: ${e.toString()}`);
      }
    }
  }

  public isOverlay(): boolean {
    return this.markerType === 'overlay';
  }

  public getOrigin(): string {
    return this.origin;
  }

  public getIconType(): string {
    return this.iconType;
  }

  public getInitialScale(): number {
    return this.initialScale;
  }

  public getCurrentScale(): number {
    return this.scale;
  }

  public setCurrentScale(scale: number): void {
    if (!!scale && scale !== this.scale) {
      this.scale = scale;
      this.svgElement.setAttribute('data-scale', scale.toString());
      this.applyScale(scale);
    }
  }

  public getStyledElements(): Element[] {
    let elements: Element[] = [
      ...(this.pathElements as unknown as Element[]),
      ...(this.circleElements as unknown as Element[])
    ];
    if (!!this.textElement) {
      elements.push(this.textElement as unknown as Element);
    }
    if (!!this.imageElement) {
      elements.push(this.imageElement as unknown as Element);
    }
    if (!!this.faSymbolElement) {
      elements.push(this.faSymbolElement as unknown as Element);
    }

    elements = elements.filter(element => !!element.getAttribute('style'));
    if (!!this.faSymbolElement) {
      elements.push(this.faSymbolElement as unknown as Element);
    }
    return elements;
  }

  public hasTextContent(): boolean {
    return !!this.textElement && !!this.iconType && this.iconType.includes('text');
  }

  public getTextContent(): string {
    return this.textContent;
  }

  public setTextContent(content: string): void {
    this.textContent = content;
    try {
      if (this.hasTextContent()) {
        if (this.origin === 'exelor') {
          this.textElement.innerHTML = content;
          const charCount = content.length;

          if (this.iconType === 'text-box') {
            this.formatTextBox(charCount);
            this.applyScale(this.scale);
          } else if (this.iconType === 'text-droplet') {
            let textLength = 70;
            switch (charCount) {
              case 1: {
                textLength = 40;
                break;
              }
              case 2: {
                textLength = 50;
                break;
              }
              case 3: {
                textLength = 60;
                break;
              }
              default: {
                break;
              }
            }
            this.textElement.setAttribute('textLength', `${textLength}%`);
          }
        } else {
          // TODO: Font Awesome
        }
      } else {
        throw Error('Marker does not support text content');
      }
    } catch (e) {
      console.error(e.toString());
      throw Error(`Failed updating text element document: ${e.toString()}`);
    }
  }

  private formatTextBox(charCount): void {
    this.adjustedWidth = (this.initialWidth + this.initialWidth * charCount) / 2;
    this.svgElement.setAttribute('width', this.adjustedWidth.toString());
    this.svgElement.setAttribute('viewBox', `0 0 ${this.adjustedWidth} ${this.initialHeight}`);

    const pathElement = this.pathElements[0];
    const pathScale = this.pathScaleStart + this.pathScaleIncr * (charCount);
    pathElement.setAttribute('transform', `scale(${pathScale}, 1)`);

    const textOffset = this.adjustedWidth / 2;
    this.textElement.setAttribute('x', textOffset.toString());

    const textLength = this.textLengthStart + charCount * 4 > 90 ? 90 : this.textLengthStart + charCount * 2;
    this.textElement.setAttribute('textLength', `${textLength}%`);
  }

  /**
   * Changes the size of the displayed icon
   * @param scale: A multiplication factor that increases or decreases the icon size.
   */
  private applyScale(scale: number): void {
    this.currentWidth = this.adjustedWidth * scale;
    this.currentHeight = this.initialHeight * scale;
    this.svgElement.setAttribute('width', this.currentWidth + 'px');
    this.svgElement.setAttribute('height', this.currentHeight + 'px');
    this.isModified = true;
  }

  public getCurrentWidth(): number {
    return this.currentWidth;
  }

  public getCurrentHeight(): number {
    return this.currentHeight;
  }

  /**
   * Sets the SVG element ID to a unique value.
   */
  public setSvgId(svgId: string): void {
    this.svgElement.setAttribute('id', svgId);
  }

  public serialize(): string {
    return new XMLSerializer().serializeToString(this.svgElement);
  }
}
