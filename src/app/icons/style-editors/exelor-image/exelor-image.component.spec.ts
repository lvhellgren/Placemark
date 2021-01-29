import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExelorImageComponent } from './exelor-image.component';

describe('ExelorImageComponent', () => {
  let component: ExelorImageComponent;
  let fixture: ComponentFixture<ExelorImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExelorImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExelorImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
