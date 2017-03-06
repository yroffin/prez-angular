import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrezHomeComponent } from './prez-home.component';

describe('PrezHomeComponent', () => {
  let component: PrezHomeComponent;
  let fixture: ComponentFixture<PrezHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrezHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrezHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
