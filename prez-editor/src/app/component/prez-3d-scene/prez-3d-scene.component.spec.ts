import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Prez3dSceneComponent } from './prez-3d-scene.component';

describe('Prez3dSceneComponent', () => {
  let component: Prez3dSceneComponent;
  let fixture: ComponentFixture<Prez3dSceneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Prez3dSceneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Prez3dSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
