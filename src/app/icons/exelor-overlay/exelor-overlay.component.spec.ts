import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExelorOverlayComponent } from './exelor-overlay.component';

describe('ExelorOverlayComponent', () => {
  let component: ExelorOverlayComponent;
  let fixture: ComponentFixture<ExelorOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExelorOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExelorOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
