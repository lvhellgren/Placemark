import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathElementComponent } from './path-element.component';

describe('PathElementComponent', () => {
  let component: PathElementComponent;
  let fixture: ComponentFixture<PathElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
