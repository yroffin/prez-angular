import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Prez3dTreeComponent } from './prez-3d-tree.component';

describe('Prez3dTreeComponent', () => {
  let component: Prez3dTreeComponent;
  let fixture: ComponentFixture<Prez3dTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Prez3dTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Prez3dTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
