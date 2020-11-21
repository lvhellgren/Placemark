import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapkeyComponent } from './mapkey.component';

describe('MapkeyComponent', () => {
  let component: MapkeyComponent;
  let fixture: ComponentFixture<MapkeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapkeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
