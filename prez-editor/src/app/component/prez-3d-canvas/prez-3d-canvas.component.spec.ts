import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Prez3dCanvasComponent } from './prez-3d-canvas.component';

describe('Prez3dCanvasComponent', () => {
  let component: Prez3dCanvasComponent;
  let fixture: ComponentFixture<Prez3dCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Prez3dCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Prez3dCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
