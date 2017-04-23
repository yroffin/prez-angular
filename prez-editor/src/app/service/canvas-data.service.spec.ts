import { TestBed, inject } from '@angular/core/testing';

import { CanvasDataService } from './canvas-data.service';

describe('CanvasDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanvasDataService]
    });
  });

  it('should ...', inject([CanvasDataService], (service: CanvasDataService) => {
    expect(service).toBeTruthy();
  }));
});
