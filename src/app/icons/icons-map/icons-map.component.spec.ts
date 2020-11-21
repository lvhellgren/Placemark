import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconsMapComponent } from './icons-map.component';

describe('IconsMapComponent', () => {
  let component: IconsMapComponent;
  let fixture: ComponentFixture<IconsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconsMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
