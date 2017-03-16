import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Prez3dElementCameraComponent } from './prez-3d-element-camera.component';

describe('Prez3dElementCameraComponent', () => {
  let component: Prez3dElementCameraComponent;
  let fixture: ComponentFixture<Prez3dElementCameraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Prez3dElementCameraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Prez3dElementCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
