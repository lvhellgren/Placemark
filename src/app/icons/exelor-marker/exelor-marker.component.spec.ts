import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExelorMarkerComponent } from './exelor-marker.component';

describe('ExelorMarkerComponent', () => {
  let component: ExelorMarkerComponent;
  let fixture: ComponentFixture<ExelorMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExelorMarkerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExelorMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
