import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Prez3dElementMeshComponent } from './prez-3d-element-mesh.component';

describe('Prez3dElementMeshComponent', () => {
  let component: Prez3dElementMeshComponent;
  let fixture: ComponentFixture<Prez3dElementMeshComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Prez3dElementMeshComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Prez3dElementMeshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
